import Model from "./Model.js";

export default class Persona extends Model {
  table = "personas";
  constructor(nombre, apellido,edad,sexo,telefono) {
    super();
    this.id = Date.now();
    this.nombre = nombre;
    this.apellido = apellido;
    this.edad = edad;
    this.sexo = sexo;
    this.telefono = telefono;
  }
}