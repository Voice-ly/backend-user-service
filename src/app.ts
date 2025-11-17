import express, { Request, Response } from "express";

const app = express();

app.get("/", (_req: Request, res: Response) => {
    res.send("App funcionando");
});

app.listen(3000, () => {
    console.log("App funcionando");
});
