import { Mutation, Resolver, Arg, InputType, Field, Query } from "type-graphql";
import { Author } from "../entity/author.entity";
import { getRepository, Repository } from "typeorm";

@InputType()
class AuthorInput {
  @Field()
  fullName!: string;
}

@InputType()
class AuthorUpdateInput {
  @Field(() => Number)
  id!: number;

  @Field()
  fullName?: string;
}

@InputType()
class AuthorIdInput {
  @Field(() => Number)
  id!: number;
}

@Resolver()
export class AuthorResolver {
  authorRepository: Repository<Author>;

  constructor() {
    this.authorRepository = getRepository(Author);
  }

  @Mutation(() => Author)
  async createAuthor(
    @Arg("input", () => AuthorInput) input: AuthorInput
  ): Promise<Author | undefined> {
    try {
      const createdAuthor = await this.authorRepository.insert({
        fullName: input.fullName,
      });
      const result = await this.authorRepository.findOne(
        createdAuthor.identifiers[0].id
      );
      return result;
    } catch {
      console.error;
    }
  }

  @Query(() => [Author])
  async getAllAuthors(): Promise<Author[]> {
    return await this.authorRepository.find({ relations: ["books"] });
  }

  @Query(() => Author)
  async getOneAuthor(
    @Arg("input", () => AuthorIdInput) input: AuthorIdInput
  ): Promise<Author | undefined> {
    try {
      const author = await this.authorRepository.findOne(input.id);
      if (!author) {
        const error = new Error();
        error.message = "Author does not exists";
        throw error;
      }
      return author;
    } catch (e) {
      throw new Error(e);
    }
  }

  @Mutation(() => Author)
  async updateOneAuthor(
    @Arg("input", () => AuthorUpdateInput) input: AuthorUpdateInput
  ): Promise<Author | undefined> {
    const authorExists = await this.authorRepository.findOne(input.id);

    if (!authorExists) {
      throw new Error("Author does not exists");
    }

    const updatedAuthor = await this.authorRepository.save({
      id: input.id,
      fullName: input.fullName,
    });
    return await this.authorRepository.findOne(updatedAuthor.id);
  }

  @Mutation(() => Boolean)
  async deleteOneAuthor(
    @Arg("input", () => AuthorIdInput) input: AuthorIdInput
  ): Promise<Boolean> {
    await this.authorRepository.delete(input.id);
    return true;
  }
}
