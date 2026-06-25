import inquirer from "inquirer";
import chalk from "chalk";

export default class Helper {
  static async menu(titulo, opciones) {
    const { opcion } = await inquirer.prompt([
      {
        type: "select",
        name: "opcion",
        message: chalk.bold(titulo),
        choices: opciones,
      },
    ]);
    return opcion;
  }

  static async esperar() {
    await inquirer.prompt([
      {
        type: "input",
        name: "enter",
        message: `Presione ${chalk.green("ENTER")} para continuar...`,
      },
    ]);
  }
}
