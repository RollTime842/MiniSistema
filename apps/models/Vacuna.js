import Model from "./Model.js";

export default class Vacuna extends Model {
  table = "vacunas";

  constructor(nombre, laboratorio, doctor) {
    super();

    this.id = Date.now();
    this.nombre = nombre;
    this.laboratorio = laboratorio;
    this.doctor = doctor; // relación directa
  }
}