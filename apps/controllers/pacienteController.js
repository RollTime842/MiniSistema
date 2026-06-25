import inquirer from "inquirer";
import chalk from "chalk";
import Paciente from "../models/Paciente.js";
import Vacuna from "../models/Vacuna.js";
import Helper from "../helpers/helper.js";


export default class PacienteController {
  opcion = 0;
  opciones = [
    {
      name: "Menu anterior",
      value: 0,
    },
    {
      name: "Mostrar Pacientes",
      value: 1,
    },
    {
      name: "Crear Paciente",
      value: 2,
    },
  ];
  constructor(opcion) {
    this.opcion = opcion;
    this.paciente = new Paciente();
    this.vacuna = new Vacuna();
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

    if (vacunas.length === 0) {
      console.log(chalk.bgRed.white("No hay vacunas registradas. Cree una vacuna primero."));
      console.log();
      await Helper.esperar();
      return;
    }

    let payload = await inquirer.prompt([
      {
        type: "input",
        name: "nombre",
        message: "Ingrese el nombre del paciente",
        validate: (input) => {
          if (input.trim() === "") {
            return "El nombre del paciente no puede estar vacío.";
          }
          return true;
        },
      },
      {
        type: "input",
        name: "apellido",
        message: "Ingrese el apellido del paciente",
        validate: (input) => {
          if (input.trim() === "") {
            return "El apellido del paciente no puede estar vacío.";
          }
          return true;
        },
      },
      {
        type: "input",
        name: "edad",
        message: "Ingrese la edad del paciente",
        validate: (input) => {
          const edad = parseInt(input);
          if (isNaN(edad) || edad <= 0) {
            return "La edad del paciente debe ser un número positivo.";
          }
          return true;
        },
      },
      {
        type: "select",
        name: "sexo",
        message: "Seleccione el sexo del paciente",
        choices: [
          {
            name: "Masculino",
            value: "M",
          },
          {
            name: "Femenino",
            value: "F",
          },
        ],
        validate: (input) => {
          if (input.trim() === "") {
            return "El sexo del paciente no puede estar vacío.";
          }
          return true;
        },
      },
      {
        type: "select",
        name: "vacuna",
        message: "Seleccione la vacuna del paciente",
        choices: vacunas.map((vacuna) => {
          return {
            name: vacuna.nombre,
            value: vacuna,
          };
        }),
        validate: (input) => {
          if (input.trim() === "") {
            return "La vacuna del paciente no puede estar vacía.";
          }
          return true;
        },
      },
    ]);

    const existe = await this.validatePaciente(
      payload.nombre,
      payload.apellido,
    );

    if (existe) {
      console.log(
        chalk.bgRed.white("No se puede crear el paciente, ya existe"),
      );
      console.log();
      await Helper.esperar();
      return;
    }

    console.log(payload);
    await Helper.esperar();

    await this.paciente.save({
      table: this.paciente.getTable(),
      id: Date.now(),
      nombre: payload.nombre,
      apellido: payload.apellido,
      edad: payload.edad,
      sexo: payload.sexo,
      vacuna: payload.vacuna,
    });
    console.log(chalk.bgGreen.white("Paciente creado exitosamente"));
    await Helper.esperar();
  }

  async read() {
    console.log(chalk.bgBlue.white("Mostrando pacientes..."));
    console.log();
    const pacientes = await this.paciente.load();
    const rows = pacientes.map((paciente) => {
      return {
        nombre: paciente.nombre,
        apellido: paciente.apellido,
        edad: paciente.edad,
        sexo: paciente.sexo,
        vacuna: paciente.vacuna.nombre,
      };
    });
    console.table(rows);
    console.log();
    await Helper.esperar();
  }

  async validatePaciente(nombre, apellido) {
    const pacientes = await this.paciente.load();
    const paciente = pacientes.find(
      (paciente) =>
        paciente.nombre.toLowerCase().trim() ===
          nombre.toLowerCase().trim() &&
        paciente.apellido.toLowerCase().trim() ===
          apellido.toLowerCase().trim(),
    );
    return paciente;
  }

  async init() {
    let opcion;
    do {
      console.clear();
      opcion = await Helper.menu("Menú de pacientes", this.opciones);
      await this.validarMenu(opcion);
    } while (opcion != 0);
  }
}
