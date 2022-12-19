import express, {Request, Response} from 'express';

export const routeDebug = express.Router();

// Retrieves ChatGPT API instantiation and prints it to console.
routeDebug.post('/', async (req: Request, res: Response) => {
  const api = req.app.get('api');

  try {
    console.log(`----------\n${JSON.stringify(api, null, 2)}\n----------`);
    return res.status(200).json(api);
  } catch (error) {
    return res.status(500).send({error});
  }
});
