import Model from "./model.js";
import Persona from "./Persona.js";

export default class Paciente extends Model {
  table = "pacientes";

  constructor(nombre, apellido, edad, sexo, cedula) {
    super();

    Object.assign(this, new Persona(nombre, apellido));

    this.id = Date.now();
    this.edad = edad;
    this.sexo = sexo;
    this.cedula = cedula;
  }
}