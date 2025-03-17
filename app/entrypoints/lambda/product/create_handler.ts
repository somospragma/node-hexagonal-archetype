import ApiResponseBuilder, { LambdaApiResponse } from "@domain/builders/ApiResponseBuilder";
import { CreateProductCommand } from "@domain/command/create_product/command";
import { CreateProductCommandHandler } from "@domain/command/create_product/command_handler";
import LambdaHandlerInterface from "@libraries/lambda-handler-interface";
import LambdaLogger, { logger } from "@libraries/logger";
import { tracer } from "@libraries/tracer";
import { CreateProductResponse } from "@schemas/products";

export class CreateProductHandler implements LambdaHandlerInterface {
  constructor(private readonly commandHandler: CreateProductCommandHandler) {
  }

  @tracer.captureLambdaHandler()
  @logger.injectLambdaContext({ logEvent: false })
  public async handler(
    _event: AWSLambda.APIGatewayProxyEvent,
    _context: AWSLambda.Context
  ): Promise<LambdaApiResponse> {
    try {
      const parsedBody = CreateProductCommand.safeParse(JSON.parse(_event.body!));
      if (!parsedBody.success) {
        return ApiResponseBuilder.empty()
          .withStatusCode(400)
          .withBody({ errors: parsedBody.error.errors })
          .build();
      }

      const commandResponse = await this.commandHandler.execute(parsedBody.data);
      return ApiResponseBuilder.empty()
        .withStatusCode(200)
        .withHeaders({ "Content-Type": "application/json" })
        .withBody(
          CreateProductResponse.safeParse({
            id: commandResponse
          }).data!
        )
        .build();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Error";
      LambdaLogger.error(errorMessage);

      return ApiResponseBuilder.empty()
        .withStatusCode(400)
        .withBody({ error: errorMessage })
        .build();
    }
  }
}
