// Elaborado por: Geovanny Fernando Reyes Martínez




import inquirer from "inquirer";
import chalk from "chalk";
import DoctorController from "./apps/controllers/doctorController.js";
import PacienteController from "./apps/controllers/pacienteController.js";
import VacunaController from "./apps/controllers/vacunaController.js";

async function main() {
  let opcion;
  do {
    console.clear();
    const { menu } = await inquirer.prompt([
      {
        type: "select",
        name: "menu",
        message: chalk.bold("Menú Principal"),
        choices: [
          { name: "Salir", value: 0 },
          { name: "Doctores", value: 1 },
          { name: "Pacientes", value: 2 },
          { name: "Vacunas", value: 3 },
        ],
      },
    ]);
    opcion = menu;

    if (opcion === 1) {
      const controller = new DoctorController(opcion);
      await controller.init();
    } else if (opcion === 2) {
      const controller = new PacienteController(opcion);
      await controller.init();
    } else if (opcion === 3) {
      const controller = new VacunaController(opcion);
      await controller.init();
    }
  } while (opcion !== 0);
}

main();
