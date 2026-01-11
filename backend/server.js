const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const { exec } = require("child_process");

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post("/run/java", (req, res) => {
    const code = req.body.code;

    // Save Java code to file
    fs.writeFileSync("Main.java", code);

    // STEP 1: Compile Java with compatibility for Java 17
    exec("javac --release 17 Main.java", (compileErr, compileOut, compileStderr) => {
        if (compileErr || compileStderr) {
            return res.json({ output: compileStderr || compileErr.message });
        }

        // STEP 2: Run Java program
        exec("java Main", { timeout: 5000 }, (runErr, runOut, runStderr) => {
            if (runErr || runStderr) {
                return res.json({ output: runStderr || runErr.message });
            }

            return res.json({ output: runOut });
        });
    });
});

app.listen(5000, () => console.log("Java runner server started on port 5000"));
