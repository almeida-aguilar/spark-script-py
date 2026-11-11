"""Teclado (API v0.3.0): ``wedopy.key(name)`` (del módulo, v5 §10).

    space = wedopy.key("space")
    space.read()                    -> bool (¿está presionada?)
    space.has_change("pressed")     -> bool (consume los cambios pendientes)
    space.wait_change("released")   -> str  (tipo consumido)

El teclado NO forma parte del hub físico: no requiere crear un ``Hub`` ni que esté
conectado, y sus recursos no aparecen en ``ports()``. Cada tecla se comporta como
``hub.button`` con los mismos filtros (``"pressed"`` y ``"released"``), y las esperas
de teclas no terminan con ``NotConnectedError`` aunque el hub se desconecte.
"""
from . import _bridge


class Key:
    """Una tecla del teclado, seleccionada por su nombre."""

    def __init__(self, js_key) -> None:
        self._js = js_key

    @property
    def name(self) -> str:
        """El nombre de la tecla (``"up"``, ``"space"``, ...)."""
        return str(self._js.name)

    def read(self) -> bool:
        """True si la tecla está presionada. Siempre tiene estado: nunca lanza NoReadingError."""
        return bool(_bridge.call(self._js.read))

    def has_change(self, filter: str | None = None) -> bool:
        """True si hay cambios pendientes (y los consume)."""
        return bool(_bridge.call(self._js.hasChange, filter))

    def wait_change(self, filter: str | None = None) -> str:
        """Espera un cambio y devuelve su tipo ("pressed" / "released")."""
        return str(_bridge.wait(self._js.waitChange(filter)))

    def __repr__(self) -> str:
        return f"Key('{self._js.name}')"


def _key_name(name) -> str:
    """Validación del nombre de tecla: cadena no vacía (el detalle lo valida JavaScript)."""
    if isinstance(name, bool) or not isinstance(name, str):
        raise TypeError("key: la tecla esperaba una cadena y recibió %s" % type(name).__name__)
    if not name:
        raise ValueError('tecla "" no válida (teclas válidas: a-z, 0-9, up, down, left, right, space, enter, escape, tab, backspace, shift, control, alt)')
    return name


def key(name) -> Key:
    """Selecciona una tecla: ``wedopy.key("space")``.

    No requiere crear un ``Hub`` ni que esté conectado. El conjunto de nombres es
    cerrado, así que un nombre desconocido lanza ``ValueError`` al seleccionar la tecla,
    no al usarla; ``KeyboardUnavailableError``, al usarla.
    """
    return Key(_bridge.call(_bridge.key, _key_name(name)))
