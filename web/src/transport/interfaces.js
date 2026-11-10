// Contrato de transporte (equivalente a wedopy_core/transport/interfaces.py).
//
//  * todo método que habla con el hub recibe un `timeout` en segundos y puede lanzar
//    OperationTimeout / BLEError / HubDisconnectedError / HubConnectionError;
//  * las escrituras son SIEMPRE con respuesta: un transporte no debe degradar a
//    "write without response", porque eso eliminaría el ACK en el que se apoya el watchdog;
//  * los callbacks de notificación no deben bloquear.
//
// Los datos viajan como Uint8Array y los UUID en forma canónica de 128 bits en minúsculas.
import { InvalidStateError } from "../core/errors.js";

const METHODS = ["setCallbacks", "connect", "disconnect", "hasCharacteristic", "read", "write", "subscribe", "unsubscribe"];

export class Transport {
  /** true si `connect()` espera una acción del usuario (selector del navegador). */
  interactive = false;

  /** `onNotify(charUuid, data)` y `onDisconnect(reason)`. */
  setCallbacks(_onNotify, _onDisconnect) { throw new InvalidStateError("not implemented"); }
  /** Busca/selecciona un hub WeDo 2.0, conecta y descubre servicios. */
  async connect(_timeout) { throw new InvalidStateError("not implemented"); }
  /** Cierra el enlace. Debe ser seguro llamarlo sin conexión. */
  async disconnect(_timeout) { throw new InvalidStateError("not implemented"); }
  hasCharacteristic(_uuid) { throw new InvalidStateError("not implemented"); }
  async read(_uuid, _timeout) { throw new InvalidStateError("not implemented"); }
  /** Escribe con respuesta; vuelve solo cuando el hub confirma (ACK). */
  async write(_uuid, _data, _timeout) { throw new InvalidStateError("not implemented"); }
  async subscribe(_uuid, _timeout) { throw new InvalidStateError("not implemented"); }
  async unsubscribe(_uuid, _timeout) { throw new InvalidStateError("not implemented"); }
}

/** Comprueba que un objeto cumple el contrato (útil con transportes de terceros). */
export function assertTransport(obj) {
  const missing = METHODS.filter((m) => typeof obj?.[m] !== "function");
  if (missing.length) throw new TypeError(`transport is missing: ${missing.join(", ")}`);
  return obj;
}
