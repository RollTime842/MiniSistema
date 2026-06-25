import inquirer from "inquirer";
import chalk from "chalk";
import Vacuna from "../models/Vacuna.js";
import Carrera from "../models/carrera.js";
import Helper from "../helpers/helper.js";

export default class VacunaController {
  opcion = 0;
  opciones = [
    {
      name: "Menu anterior",
      value: 0,
    },
    {
      name: "Mostrar Vacunas",
      value: 1,
    },
    {
      name: "Crear Vacuna",
      value: 2,
    },
  ];
  constructor(opcion) {
    this.opcion = opcion;
    this.vacuna = new Vacuna();
    this.carrera = new Carrera();
  }

  async validarMenu(opcion) {
    if (opcion == 0) {
      return;
    } else if (opcion == 1) {
      await this.read();
    } else if (opcion == 2) {
      await this.create();
    } else {
      console.log(chalk.bgRed.white("Opción no válida"));
    }
  }

  async create() {
    const vacunas = await this.vacuna.load();

    let payload = await inquirer.prompt([
      {
        type: "input",
        name: "nombre",
        message: "Ingrese el nombre de la vacuna",
        validate: (input) => {
          if (input.trim() === "") {
            return "El nombre de la vacuna no puede estar vacío.";
          }
          return true;
        },
      }
    ]);

    const existe = await this.validateVacuna(
      payload.nombre
    );

    if (existe) {
      console.log(
        chalk.bgRed.white("No se puede crear la vacuna, ya existe"),
      );
      console.log();
      await Helper.esperar();
      return;
    }

    console.log(payload);
    await Helper.esperar();

    await this.vacuna.save({
      table: this.vacuna.getTable(),
      id: Date.now(),
      nombre: payload.nombre,
    });
    console.log(chalk.bgGreen.white("Vacuna creada exitosamente"));
    await Helper.esperar();
  }

  async read() {
    console.log(chalk.bgBlue.white("Mostrando vacunas..."));
    console.log();
    const vacunas = await this.vacuna.load();
    const rows = vacunas.map((vacuna) => {
      return {
        nombre: vacuna.nombre,
      };
    });
    console.table(rows);
    console.log();
    await Helper.esperar();
  }

  async update() {}


  async delete() {}

  async validateVacuna(nombre) {
    const vacunas = await this.vacuna.load();
    const vacuna = vacunas.find(
      (vacuna) =>
        vacuna.nombre.toLowerCase().trim() ===
          nombre.toLowerCase().trim(),
    );
    return vacuna;
  }

  async init() {
    let opcion;
    do {
      console.clear();
      opcion = await Helper.menu("Menú de vacunas", this.opciones);
      await this.validarMenu(opcion);
    } while (opcion != 0);
  }
}
