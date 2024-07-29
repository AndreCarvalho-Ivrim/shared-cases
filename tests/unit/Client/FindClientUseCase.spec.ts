import dotenv from "dotenv";
dotenv.config();

import { IShortClientRepository } from "../../../types/client.type";
import { FindClientUseCase } from "../../../useCases/client/FindClientUseCase";

describe("FindClientUseCase", () => {
  let repository: IShortClientRepository;
  let useCase: FindClientUseCase;
  let clientId: string;

  beforeAll(async () => {
    try {
      if (process.env.TEST_ENV === "hub") {
        // @ts-ignore
        const { ClientRepository } = await import("../../../../repositories/in-SQLite/ClientRepository"); 
        repository = new ClientRepository();
      }
      else {
        // @ts-ignore
        const { ClientProvider } = await import("../../../../../infra/Services/implements/ClientProvider.ts")
        repository = new ClientProvider();
      }
      
      useCase = new FindClientUseCase(repository);
      clientId = process.env.TEST_CLIENT_ID as string;
    } catch (error) {
      throw new Error("Erro ao tentar importar o repositório: " + error.message);
    }
  })

  it("should have any return", async () => {
    const client = await useCase.execute(clientId);
    expect(client).toBeDefined();
  })
  
  it("should have return an object that contain the id and users keys", async () => {
    const client = await useCase.execute(clientId);
    expect(client).toHaveProperty("id");
    expect(client).toHaveProperty("users");
  })

  it("should return a key 'users' with a array that contains items", async () => {
    const client = await useCase.execute(clientId);
    expect(client.users && client.users.length).toBeGreaterThan(0);
  })
  
  it("should return a error message if trying request with a inexistent client id", async () => {
    try {
      await useCase.execute("123abc");
    } catch(error) {
      expect(error.message).toMatch("Cliente não encontrado");
    }
  })
})