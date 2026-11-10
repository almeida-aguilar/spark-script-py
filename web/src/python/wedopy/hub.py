"""``Hub`` (misma API que wedopy.hub) sobre el hub conectado en el panel de wedopy Web.

Diferencias respecto a la biblioteca Python de escritorio:

* ``Hub()`` usa el hub que ya está conectado en el panel «Conexión» (real o simulado); el
  selector Bluetooth del navegador necesita un clic del usuario y no puede abrirse desde un programa.
* ``disconnect()`` / salir de ``with Hub()`` cancelan las tareas y paran los motores, pero
  mantienen el enlace para poder ejecutar otro programa sin volver a elegir el dispositivo.
* ``time.sleep`` es cooperativo: cede el control a la página y admite el botón «Detener».
"""
from . import _bridge
from .button import Button
from .exceptions import AmbiguousDeviceError, DeviceNotFoundError, DeviceTypeError  # noqa: F401
from .led import LED
from .motor import Motor, MotorGroup
from .sensors import DistanceSensor, TiltSensor
from .tasks import TaskManager

_PORTS = ("A", "B")


def _port(port):
    if not isinstance(port, str):
        raise TypeError("port must be 'A' or 'B', not %s" % type(port).__name__)
    if port.upper() not in _PORTS:
        raise ValueError("port must be 'A' or 'B', got %r" % port)
    return port.upper()


class Hub:
    """Create it, then ``connect()`` or use it as a context manager (recommended)::

        with Hub() as hub:
            hub.motor("A").run(100)
    """

    def __init__(self, *, transport=None, timing=None):
        # `transport` y `timing` se aceptan por compatibilidad; en el navegador los fija el panel.
        self._js = _bridge.hub()
        self._led = LED(self._js.led)
        self._button = Button(self._js.button)
        self._tasks = TaskManager(sleeper=_bridge.sleep, on_interrupt=self._interrupted)

    # -- lifecycle ------------------------------------------------------------

    def connect(self):
        """Usa el hub del panel. Devuelve ``self``."""
        if not self.is_connected:
            _bridge.wait(self._js.connect())  # puede fallar sin gesto de usuario: conecta desde el panel
        return self

    @property
    def is_connected(self):
        return bool(self._js.isConnected)

    def disconnect(self):
        """Cancel tasks and try to stop the motors. The link stays open (see module docstring)."""
        self._tasks.cancel()
        if self.is_connected:
            _bridge.wait(self._js.stopAll())

    def shutdown(self):
        """Ask the hub to power off. It must be switched on by hand afterwards."""
        self._tasks.cancel()
        try:
            self.stop_all()
        except Exception:
            pass
        _bridge.wait(self._js.shutdown())

    def stop_all(self):
        """Ask every motor to stop."""
        _bridge.wait(self._js.stopAll())

    def __enter__(self):
        return self.connect()

    def __exit__(self, exc_type, exc, tb):
        try:
            self.disconnect()
        except Exception:
            if exc_type is None:
                raise
        return False

    def _interrupted(self):
        """Detener / Ctrl+C durante ``tasks.wait()``: intenta parar los motores."""
        try:
            _bridge.wait(self._js.stopAll())
        except BaseException:
            pass

    # -- ports and devices ------------------------------------------------------

    @property
    def ports(self):
        """Snapshot of the known external devices, e.g. ``{"A": "motor", "B": "distance"}``."""
        return _bridge.get(self._js, "ports").to_py()

    def refresh_ports(self):
        return _bridge.wait(self._js.refreshPorts()).to_py()

    def motor(self, port=None):
        return Motor(_bridge.call(self._js.motor, None if port is None else port))

    def motors(self, ports):
        """A group of motors, e.g. ``hub.motors(("A", "B"))``; driven A first, then B."""
        if isinstance(ports, str):
            raise TypeError("ports must be a sequence such as ('A', 'B')")
        ports = list(ports)
        if not ports:
            raise ValueError("ports must not be empty")
        norm = [_port(p) for p in ports]
        if len(set(norm)) != len(norm):
            raise ValueError("duplicate port in %r" % (ports,))
        return MotorGroup([self.motor(p) for p in norm])

    def distance_sensor(self, port=None):
        return DistanceSensor(_bridge.call(self._js.distanceSensor, None if port is None else port))

    def tilt_sensor(self, port=None):
        return TiltSensor(_bridge.call(self._js.tiltSensor, None if port is None else port))

    @property
    def led(self):
        return self._led

    @property
    def button(self):
        return self._button

    @property
    def tasks(self):
        """Cooperative task manager of this hub (``add`` / ``wait`` / ``cancel``)."""
        return self._tasks
