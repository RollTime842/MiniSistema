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
    // NUEVO AGREGADO
    {
      name: "Actualizar Paciente",
      value: 3,
    },
    // NUEVO AGREGADO
    {
      name: "Eliminar Paciente",
      value: 4,
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
  
  // NUEVO AGREGADO
  async update() {
    const pacientes = await this.paciente.load();
    const vacunas = await this.vacuna.load();
    if (!pacientes.length) {
      console.log(chalk.bgRed.white("No hay pacientes."));
      await Helper.esperar();
      return;
    }
    if (!vacunas.length) {
      console.log(chalk.bgRed.white("No hay vacunas. Cree una primero."));
      await Helper.esperar();
      return;
    }
    const { idx } = await inquirer.prompt([{
      type: "select", name: "idx", message: "Seleccione paciente a actualizar",
      choices: pacientes.map((p, i) => ({ name: `${p.nombre} ${p.apellido}`, value: i })),
    }]);
    const p = pacientes[idx];
    const cambios = await inquirer.prompt([
      { type: "input", name: "nombre", message: "Nombre", default: p.nombre, validate: v => v.trim() ? true : "Req" },
      { type: "input", name: "apellido", message: "Apellido", default: p.apellido, validate: v => v.trim() ? true : "Req" },
      { type: "input", name: "edad", message: "Edad", default: p.edad, validate: v => { const n = parseInt(v); return isNaN(n)||n<=0 ? "Número positivo" : true; } },
      { type: "select", name: "sexo", message: "Sexo", default: p.sexo, choices: [{name:"Masculino",value:"M"},{name:"Femenino",value:"F"}] },
      { type: "select", name: "vacuna", message: "Vacuna", choices: vacunas.map(v => ({ name: v.nombre, value: v })) },
    ]);
    pacientes[idx] = { ...p, ...cambios };
    await this.paciente.saveAll(pacientes);
    console.log(chalk.bgGreen.white("Paciente actualizado exitosamente"));
    await Helper.esperar();
  }

  // NUEVO AGREGADO
  async delete() {
    const pacientes = await this.paciente.load();
    if (!pacientes.length) {
      console.log(chalk.bgRed.white("No hay pacientes."));
      await Helper.esperar();
      return;
    }
    const { idx } = await inquirer.prompt([{
      type: "select", name: "idx", message: "Seleccione paciente a eliminar",
      choices: pacientes.map((p, i) => ({ name: `${p.nombre} ${p.apellido}`, value: i })),
    }]);
    const { ok } = await inquirer.prompt([{ type: "confirm", name: "ok", message: `¿Eliminar a ${pacientes[idx].nombre} ${pacientes[idx].apellido}?`, default: false }]);
    if (ok) {
      pacientes.splice(idx, 1);
      await this.paciente.saveAll(pacientes);
      console.log(chalk.bgGreen.white("Paciente eliminado exitosamente"));
    } else {
      console.log(chalk.bgYellow.white("Operación cancelada"));
    }
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
