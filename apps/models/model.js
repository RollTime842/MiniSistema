import Model from "./model.js";

export default class AplicacionVacuna extends Model {
  table = "aplicaciones";

  constructor(paciente, vacuna, fecha) {
    super();
    this.id = Date.now();
    this.paciente = paciente;
    this.vacuna = vacuna;
    this.fecha = fecha;
  }
}