import Model from "./model.js";
import Persona from "./Persona.js";

export default class Doctor extends Model {
  table = "doctores";

  constructor(nombre, apellido, especialidad, telefono) {
    super();

    Object.assign(this, new Persona(nombre, apellido));

    this.id = Date.now();
    this.especialidad = especialidad;
    this.telefono = telefono;
  }
}