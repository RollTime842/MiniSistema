import Model from "./Model.js";
import Persona from "./persona.js";

export default class Paciente extends Model {
  table = "pacientes";

  constructor(nombre, apellido, edad, sexo,telefono) {
    super(nombre, apellido, edad, sexo,telefono);
  }
}