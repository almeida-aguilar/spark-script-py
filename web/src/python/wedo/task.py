"""Concurrencia cooperativa (API v0.3.0): ``wedo.task`` (del módulo, v5 §12).

    task = wedo.task.spawn(movement)   # movement es un invocable sin parámetros
    wedo.task.wait(1)                  # suspende el flujo actual
    task.cancel()                      # cancelación cooperativa
    task.join()                        # espera a que termine

La cancelación se entrega como la excepción ``TaskCancelled`` dentro de la tarea, en su
siguiente punto cooperativo (``wait``, ``wait_change``, ``wait_connection``, ``join``).
La cancelación es persistente: después del pedido, todo punto cooperativo posterior de esa
tarea vuelve a lanzarla (así los bloques ``finally`` no pueden quedarse esperando). Como
``TaskCancelled`` deriva de ``BaseException``, un ``except Exception`` no la captura por
accidente: si se captura, hay que volver a lanzarla.

En el navegador cada tarea corre en su propia pila de Python, de modo que varias tareas se
alternan de verdad mientras una espera. Si una tarea falla con una excepción no capturada,
el runtime lo informa por el registrador ``"wedo"`` (nivel ERROR, con traceback) y no
propaga el error a quien la creó.
"""
import logging
import sys

from . import _bridge
from .exceptions import TaskCancelled

_log = logging.getLogger("wedo")

# Tareas vivas por id (para poder comprobar la cancelación).
_tasks = {}


def _current_task_id():
    """Id de la tarea que está ejecutando la pila actual (``None`` en el flujo principal).

    Cada tarea corre en su propia pila de Python, así que el local ``_wedo_task_id`` de su
    frame se encuentra recorriendo la cadena de frames.
    """
    frame = sys._getframe(1)
    while frame is not None:
        task_id = frame.f_locals.get("_wedo_task_id")
        if task_id is not None:
            return task_id
        frame = frame.f_back
    return None


def _check_cancelled(task_id):
    """Si la tarea fue cancelada, lanza ``TaskCancelled`` (la cancelación es persistente)."""
    if task_id is None:
        return
    task = _tasks.get(task_id)
    if task is not None and task.cancelled:
        raise TaskCancelled("la tarea fue cancelada")


def _check_cooperative(task_id):
    """Los puntos cooperativos solo existen en el flujo principal o dentro de una tarea.."""
    if task_id is None:
        return
    # Dentro de una tarea la cancelación pendiente se comprueba en el punto de espera.
    _check_cancelled(task_id)


def _number(name, value):
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise TypeError("%s esperaba un número y recibió %s" % (name, type(value).__name__))
    return value


def _seconds(value):
    """Validación del argumento de ``wait``/``wait_connection``: número finito >= 0."""
    _number("espera", value)
    if value != value or value == float("inf") or value == float("-inf") or value < 0:
        raise ValueError(
            "wedo.task: wait esperaba un número mayor o igual que 0 y recibió %r" % (value,)
        )
    return float(value)


class Task:
    """Una tarea concurrente creada con ``wedo.task.spawn``."""

    def __init__(self, manager, function) -> None:
        self._manager = manager
        self._function = function
        self._id = Task._next_id()
        self._cancelled = False
        _tasks[self._id] = self

    _counter = 0

    @classmethod
    def _next_id(cls):
        cls._counter += 1
        return cls._counter

    @property
    def id(self) -> int:
        """Identificador interno de la tarea."""
        return self._id

    @property
    def cancelled(self) -> bool:
        """True si se pidió su cancelación."""
        return self._cancelled

    def _entry(self):
        # Local del frame: ``_current_task_id()`` lo encuentra al recorrer la pila.
        _wedo_task_id = self._id
        try:
            self._function()
        except (TaskCancelled, KeyboardInterrupt):
            raise  # la cancelación no es un error de ejecución: no se notifica
        except BaseException:
            # Fallo de la tarea: se informa por logging (with traceback) y el error no
            # se propaga a quien la creó (spawn); el_join() del que espera no la relanza.
            _log.exception("la tarea %d falló", self._id)
            raise
        finally:
            del _wedo_task_id

    def cancel(self) -> None:
        """Solicita cancelar la tarea (cooperativa y persistente)."""
        self._cancelled = True
        _bridge.call(self._manager.cancel, self._id)

    def join(self) -> None:
        """Espera a que la tarea termine (no propaga su excepción)."""
        task_id = _current_task_id()
        if task_id == self._id:
            raise RuntimeError("una tarea no puede unirse a sí misma")
        _resolve_marker(_bridge.wait(_bridge.call(self._manager.join, self._id, task_id)))
        _check_cancelled(task_id)

    def __repr__(self) -> str:
        return "Task(%d)" % self._id


def _resolve_marker(marker) -> None:
    """Traduce el marcador de una espera ("ok" | "cancelled" | "stopped") a su excepción.

    El marcador llega en la resolución del lado JavaScript (nunca se rechaza la promesa
    a través de ``run_sync``): la excepción se lanza AQUÍ, ya en la pila Python de la
    tarea, con lo cual los bloques ``finally`` sí se ejecutan.
    """
    name = marker if isinstance(marker, str) else str(marker) if marker is not None else "ok"
    if name == "cancelled":
        raise TaskCancelled("la tarea fue cancelada")
    if name == "stopped":
        raise KeyboardInterrupt("programa detenido desde el editor")


class TaskNamespace:
    """El espacio de nombres ``wedo.task`` (instancia única: hay un planificador
    por proceso; las tareas son del programa y no del hub, v5 §12)."""

    @property
    def _manager(self):
        """El planificador de JavaScript, que vive en el puente del runtime."""
        return _bridge.task_manager()

    def _all_settled(self) -> None:
        """Espera cooperativamente a que terminen todas las tareas (lo usa el ``with``)."""
        _bridge.wait(_bridge.call(self._manager.allSettled))

    def _cancel_all(self) -> None:
        """Pide la cancelación de todas las tareas en ejecución (lo usa el ``with``)."""
        _bridge.call(self._manager.cancelAll)

    def spawn(self, function) -> Task:
        """Crea y programa una tarea; devuelve su referencia."""
        if not callable(function):
            raise TypeError("spawn esperaba un invocable y recibió %s" % type(function).__name__)
        task = Task(self._manager, function)
        _bridge.call(self._manager.spawn, task._id, task._entry)
        return task

    def wait(self, seconds: float) -> None:
        """Suspende la ejecución actual durante ``seconds`` segundos (cooperativo)."""
        task_id = _current_task_id()
        _resolve_marker(_bridge.wait(_bridge.call(self._manager.wait, task_id, _seconds(seconds))))
        _check_cancelled(task_id)


# La instancia del módulo: ``wedo.task``.
task = TaskNamespace()
