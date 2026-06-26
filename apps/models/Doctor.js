import Model from "./Model.js"; 
import Persona from "./persona.js";

export default class Doctor extends Model {
  table = "doctores";

  constructor(nombre, apellido,edad,sexo,telefono,especialidad) {
    super(nombre, apellido,edad,sexo , telefono);
    this.especialidad = especialidad;
  }
}