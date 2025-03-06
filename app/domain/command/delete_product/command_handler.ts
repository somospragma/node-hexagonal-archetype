import ProductRepository from "@ports/product-repository";
import { DeleteProductCommand } from "./command";
import DomainException from "@domain/exceptions/domain-exception";
import { DOMAIN_ERROR_MESSAGE } from "@domain/constants/constants";

export class DeleteProductCommandHandler {
	constructor(private readonly repository: ProductRepository) {}

	async execute(command: DeleteProductCommand): Promise<string> {
		try {
			await this.repository.delete(command.id);

			return command.id;
		} catch (error) {
			throw new DomainException(
				error instanceof Error ? error.message : DOMAIN_ERROR_MESSAGE
			);
		}
	}
}
