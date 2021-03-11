import { readFileSync, writeFileSync } from "fs";
import { APIGatewayIntegrator } from './apigateway.integrator';

const data = readFileSync('src/input.json').toString();
const apiGWInstance = new APIGatewayIntegrator(JSON.parse(data));
apiGWInstance.addIntegration().then(res => writeFileSync('out.json', JSON.stringify(res)))
.catch(err => console.error(err));