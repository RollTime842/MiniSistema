import inquirer from "inquirer";
import chalk from "chalk";
import Doctor from "../models/Doctor.js";
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
      {
      name: "Actualizar Doctor",
      value: 3,
    },
    // NUEVO AGREGADO
    {
      name: "Eliminar Doctor",
      value: 4,
    },

    
  ];
  constructor(opcion) {
    this.opcion = opcion;
    this.doctor = new Doctor();
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
      },
      {
        type: "input",
        name: "especialidad",
        message: "Ingrese la especialidad del doctor",
        validate: (input) => {
          if (input.trim() === "") {
            return "La especialidad del doctor no puede estar vacía.";
          }
          return true;
        },
      },
      {
        type: "input",
        name: "telefono",
        message: "Ingrese el teléfono del doctor",
        validate: (input) => {
          if (input.trim() === "") {
            return "El teléfono del doctor no puede estar vacío.";
          }
          return true;
        },
      }
    ]);

    const existe = await this.validateDoctor(
      payload.nombre,
      payload.apellido,
      payload.edad,
      payload.sexo,
      payload.telefono,
      payload.especialidad,
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
      telefono: payload.telefono,
      especialidad: payload.especialidad,
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
        telefono: doctor.telefono,
        especialidad: doctor.especialidad,
      };
    });
    console.table(rows);
    console.log();
    await Helper.esperar();
  }
  // NUEVO AGREGADO
  async update() {
    const doctores = await this.doctor.load();
    if (!doctores.length) {
      console.log(chalk.bgRed.white("No hay doctores registrados."));
      await Helper.esperar();
      return;
    }
    const { idx } = await inquirer.prompt([{
      type: "select", name: "idx", message: "Seleccione doctor a actualizar",
      choices: doctores.map((d, i) => ({ name: `${d.nombre} ${d.apellido} - ${d.especialidad}`, value: i })),
    }]);
    const d = doctores[idx];
    const cambios = await inquirer.prompt([
      { type: "input", name: "nombre", message: "Nombre", default: d.nombre, validate: v => v.trim() ? true : "Req" },
      { type: "input", name: "apellido", message: "Apellido", default: d.apellido, validate: v => v.trim() ? true : "Req" },
      { type: "input", name: "edad", message: "Edad", default: d.edad, validate: v => { const n = parseInt(v); return isNaN(n)||n<=0 ? "Número positivo" : true; } },
      { type: "select", name: "sexo", message: "Sexo", default: d.sexo, choices: [{name:"Masculino",value:"M"},{name:"Femenino",value:"F"}] },
      { type: "input", name: "telefono", message: "Teléfono", default: d.telefono, validate: v => v.trim() ? true : "Req" },
      { type: "input", name: "especialidad", message: "Especialidad", default: d.especialidad, validate: v => v.trim() ? true : "Req" },
    ]);
    doctores[idx] = { ...d, ...cambios };
    await this.doctor.saveAll(doctores);
    console.log(chalk.bgGreen.white("Doctor actualizado exitosamente"));
    await Helper.esperar();
  }

  // NUEVO AGREGADO
  async delete() {
    const doctores = await this.doctor.load();
    if (!doctores.length) {
      console.log(chalk.bgRed.white("No hay doctores."));
      await Helper.esperar();
      return;
    }
    const { idx } = await inquirer.prompt([{
      type: "select", name: "idx", message: "Seleccione doctor a eliminar",
      choices: doctores.map((d, i) => ({ name: `${d.nombre} ${d.apellido} - ${d.especialidad}`, value: i })),
    }]);
    const { ok } = await inquirer.prompt([{ type: "confirm", name: "ok", message: `¿Eliminar a ${doctores[idx].nombre} ${doctores[idx].apellido}?`, default: false }]);
    if (ok) {
      doctores.splice(idx, 1);
      await this.doctor.saveAll(doctores);
      console.log(chalk.bgGreen.white("Doctor eliminado exitosamente"));
    } else {
      console.log(chalk.bgYellow.white("Operación cancelada"));
    }
    await Helper.esperar();
  }
  //-----------------------------------------------------//

  async validateDoctor(nombre, apellido, edad, sexo) {
    const doctores = await this.doctor.load();
    const doctor = doctores.find(
      (doctor) =>
        doctor.nombre.toLowerCase().trim() ===
          nombre.toLowerCase().trim() &&
        doctor.apellido.toLowerCase().trim() ===
          apellido.toLowerCase().trim() &&
        doctor.edad.toLowerCase().trim() ===
          edad.toLowerCase().trim() &&
        doctor.sexo.toLowerCase().trim() ===
          sexo.toLowerCase().trim()&&
        doctor.especialidad.toLowerCase().trim() ===
          especialidad.toLowerCase().trim() &&
        doctor.telefono.toLowerCase().trim() ===
          telefono.toLowerCase().trim()
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
