import inquirer from "inquirer";
import chalk from "chalk";
import Doctor from "../models/Doctor.js";
import Paciente from "../models/Paciente.js";
import Helper from "../helpers/helper.js";

export default class DoctorController {
  opcion = 0;
  opciones = [
    {
      name: "Menu anterior",
      value: 0,
    },
    {
      name: "Mostrar Doctores",
      value: 1,
    },
    {
      name: "Crear Doctor",
      value: 2,
    },
  ];
  constructor(opcion) {
    this.opcion = opcion;
    this.doctor = new Doctor();
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
    const doctores = await this.doctor.load();

    let payload = await inquirer.prompt([
      {
        type: "input",
        name: "nombre",
        message: "Ingrese el nombre del doctor",
        validate: (input) => {
          if (input.trim() === "") {
            return "El nombre del doctor no puede estar vacío.";
          }
          return true;
        },
      },
      {
        type: "input",
        name: "apellido",
        message: "Ingrese el apellido del doctor",
        validate: (input) => {
          if (input.trim() === "") {
            return "El apellido del doctor no puede estar vacío.";
          }
          return true;
        },
      },
      {
        type: "input",
        name: "edad",
        message: "Ingrese la edad del doctor",
        validate: (input) => {
          const edad = parseInt(input);
          if (isNaN(edad) || edad <= 0) {
            return "La edad del doctor debe ser un número positivo.";
          }
          return true;
        },
      },
      {
        type: "select",
        name: "sexo",
        message: "Seleccione el sexo del doctor",
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
            return "El sexo del doctor no puede estar vacío.";
          }
          return true;
        },
      }
    ]);

    const existe = await this.validateDoctor(
      payload.nombre,
      payload.apellido,
    );

    if (existe) {
      console.log(
        chalk.bgRed.white("No se puede crear el doctor, ya existe"),
      );
      console.log();
      await Helper.esperar();
      return;
    }

    console.log(payload);
    await Helper.esperar();

    await this.doctor.save({
      table: this.doctor.getTable(),
      id: Date.now(),
      nombre: payload.nombre,
      apellido: payload.apellido,
      edad: payload.edad,
      sexo: payload.sexo,
    });
    console.log(chalk.bgGreen.white("Doctor creado exitosamente"));
    await Helper.esperar();
  }

  async read() {
    console.log(chalk.bgBlue.white("Mostrando doctores..."));
    console.log();
    const doctores = await this.doctor.load();
    const rows = doctores.map((doctor) => {
      return {
        nombre: doctor.nombre,
        apellido: doctor.apellido,
        edad: doctor.edad,
        sexo: doctor.sexo,
      };
    });
    console.table(rows);
    console.log();
    await Helper.esperar();
  }

  async validateDoctor(nombre, apellido) {
    const doctores = await this.doctor.load();
    const doctor = doctores.find(
      (doctor) =>
        doctor.nombre.toLowerCase().trim() ===
          nombre.toLowerCase().trim() &&
        doctor.apellido.toLowerCase().trim() ===
          apellido.toLowerCase().trim(),
    );
    return doctor;
  }

  async init() {
    let opcion;
    do {
      console.clear();
      opcion = await Helper.menu("Menú de doctores", this.opciones);
      await this.validarMenu(opcion);
    } while (opcion != 0);
  }
}
