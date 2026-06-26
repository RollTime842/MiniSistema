import inquirer from "inquirer";
import chalk from "chalk";
import Vacuna from "../models/Vacuna.js";
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
  // NUEVO AGREGADO
    {
      name: "Actualizar Vacuna",
      value: 3,
    },
    // NUEVO AGREGADO
    {
      name: "Eliminar Vacuna",
      value: 4,
    },
  ];
  constructor(opcion) {
    this.opcion = opcion;
    this.vacuna = new Vacuna();
  }

  async validarMenu(opcion) {
    if (opcion == 0) {
      return;
    } else if (opcion == 1) {
      await this.read();
    } else if (opcion == 2) {
      await this.create();
       // NUEVO AGREGADO
    } else if (opcion == 3) {
      await this.update();
    // NUEVO AGREGADO
    } else if (opcion == 4) {
      await this.delete();
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


  // NUEVO AGREGADO
  async update() {
    const vacunas = await this.vacuna.load();
    if (!vacunas.length) {
      console.log(chalk.bgRed.white("No hay vacunas."));
      await Helper.esperar();
      return;
    }
    const { idx } = await inquirer.prompt([{
      type: "select", name: "idx", message: "Seleccione vacuna a actualizar",
      choices: vacunas.map((v, i) => ({ name: v.nombre, value: i })),
    }]);
    const v = vacunas[idx];
    const cambios = await inquirer.prompt([
      { type: "input", name: "nombre", message: "Nombre", default: v.nombre, validate: inp => inp.trim() ? true : "Req" },
    ]);
    vacunas[idx] = { ...v, ...cambios };
    await this.vacuna.saveAll(vacunas);
    console.log(chalk.bgGreen.white("Vacuna actualizada exitosamente"));
    await Helper.esperar();
  }

  // NUEVO AGREGADO
  async delete() {
    const vacunas = await this.vacuna.load();
    if (!vacunas.length) {
      console.log(chalk.bgRed.white("No hay vacunas."));
      await Helper.esperar();
      return;
    }
    const { idx } = await inquirer.prompt([{
      type: "select", name: "idx", message: "Seleccione vacuna a eliminar",
      choices: vacunas.map((v, i) => ({ name: v.nombre, value: i })),
    }]);
    const { ok } = await inquirer.prompt([{ type: "confirm", name: "ok", message: `¿Eliminar "${vacunas[idx].nombre}"?`, default: false }]);
    if (ok) {
      vacunas.splice(idx, 1);
      await this.vacuna.saveAll(vacunas);
      console.log(chalk.bgGreen.white("Vacuna eliminada exitosamente"));
    } else {
      console.log(chalk.bgYellow.white("Operación cancelada"));
    }
    await Helper.esperar();
  }

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
