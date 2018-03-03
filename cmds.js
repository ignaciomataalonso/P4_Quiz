const {log, biglog, errorlog, colorize} = require("./out");
const model = require('./model');

exports.helpCmd = rl => {
    log("Commandos:");
    log(" h|help - Muestra esta ayuda.");
    log(" list - Listar los quizzes existentes.");
    log(" show <id> - Muestra la pregunta y la respuesta el quiz indicado.");
    log(" add - Añadir un nuevo quiz interactivamente.");
    log(" delete <id> - Borrar el quiz indicado.");
    log(" edit <id> - Editar el quiz indicado.");
    log(" test <id> - Probar el quiz indicado.");
    log(" p|play -Jugar a preguntar aleatoriamente todos los quizzes.");
    log(" credits - Créditos.");
    log(" q|quit - Salir del programa.");
    rl.prompt();
};

exports.listCmd = rl => {

    model.getAll().forEach((quiz, id) => {

        log(` [${colorize(id, 'magenta')}]: ${quiz.question}`);
    });

    rl.prompt();
};

exports.showCmd = (rl, id) => {

    if (typeof id === "undefined") {
        errorlog(`Falta el parámetro id.`);
    } else {
        try {
            const quiz = model.getByIndex(id);
            log(` [${colorize(id, 'magenta')}]: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
        } catch(error) {
            errorlog(error.message);
        }
    }

    rl.prompt();
};

exports.addCmd = rl => {

    rl.question(colorize(' Introduzca una pregunta: ', 'red'), question => {

        rl.question(colorize(' Introduzca la respuesta ', 'red'), answer => {

            model.add(question, answer);
            log(` ${colorize('Se ha añadido', 'magenta')}: ${question} ${colorize('=>', 'magenta')} ${answer}`);
            rl.prompt();
        });
    });
};

exports.deleteCmd = (rl, id) => {

    if (typeof id === "undefined") {
        errorlog(`Falta el parámetro id.`);
    } else {
        try {
            model.deleteByIndex(id);
        } catch(error) {
            errorlog(error.message);
        }
    }

    rl.prompt();
};

exports.editCmd = (rl, id) => {
    if (typeof id === "undefined") {
        errorlog(`Falta el parámetro id.`);
        rl.prompt();
    } else {
        try{
            const quiz = model.getByIndex(id);

            process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)},0);

            rl.question(colorize(' Introduzca una pregunta: ', 'red'), question => {

                process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)},0);

                rl.question(colorize(' Introduzca la respuesta ', 'red'), answer => {
                    model.update(id, question, answer);
                    log(` Se ha cambiado el quiz ${colorize(id, 'magenta')} por : ${question} ${colorize('=>', 'magenta')} ${answer}`);
                    rl.prompt();
                });
            });
        } catch(error) {
            errorlog(error.message);
            rl.prompt();
        }
    }
};

exports.testCmd = (rl, id) => {

    if (typeof id === "undefined") {
        errorlog(`Falta el parámetro id.`);
        rl.prompt();
    } else {
        try {
            const quiz = model.getByIndex(id);
            rl.question(` ${colorize(quiz.question,'red')}? `, answer => {
                let resp = answer.toLowerCase().trim();
                if (resp === quiz.answer.toLowerCase().trim()) {
                    biglog('Correcto', 'green');
                    rl.prompt();
                } else {
                    biglog('Incorrecto', 'red');
                    rl.prompt();
                }
            });

        } catch(error) {
            errorlog(error.message);
            rl.prompt();
        }
    }
};

exports.playCmd = rl => {

    let nquizzes = model.count();
    let score = 0;
    let toBeResolved = [];
    for (let i=0;i<nquizzes;i++) {
        toBeResolved.push(i);
    }
    const playOne = () => {
        if (toBeResolved.length===0) {
            log('No hay nada más que preguntar.');
            log('Fin del examen. Aciertos:');
            biglog(`${score}`, 'magenta');
            rl.prompt();
        } else {
            let elem = Math.floor(Math.random()*toBeResolved.length);
            let id = toBeResolved[elem];
            console.log(toBeResolved);
            console.log(elem);
            console.log(id);
            let quiz = model.getByIndex(id);
            toBeResolved.splice(elem,1);

            rl.question(` ${colorize(quiz.question, 'red')}? `, answer => {
                let resp = answer.toLowerCase().trim();
                if (resp === quiz.answer.toLowerCase().trim()) {
                    score=score+1;
                    log(`CORRECTO - Lleva ${score} aciertos.`);
                    playOne();
                } else {
                    log('INCORRECTO.');
                    log('Fin del examen. Aciertos:')
                    biglog(`${score}`, 'magenta');
                    rl.prompt();
                }
            });
        }
    }

    playOne();
};

exports.creditsCmd = rl => {
    log('Autores de la práctica:');
    log('Ignacio Mata Alonso', 'green');
    rl.prompt();
};

exports.quitCmd = rl => {
    rl.close();
};