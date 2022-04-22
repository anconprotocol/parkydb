import 'reflect-metadata'
import {
  Arg,
  Args,
  ArgsType, Ctx,
  Field,
  Int, Query,
  Resolver
} from 'type-graphql'
import { DBBlockValue } from 'parkydb-interfaces'
import { ServiceContext } from 'parkydb-interfaces'
import { ParkyDB } from '../core/db'


@ArgsType()
class BlocksArgs {
  @Field((type) => String, { nullable: false })
  query!: any

  @Field((type) => Int, { defaultValue: 10, nullable: true })
  limit!: number
}

@Resolver()
export class BlockValueResolver {
  @Query((returns) => DBBlockValue)
  async block(@Arg('cid') cid: string, @Ctx() ctx: ServiceContext): Promise<DBBlockValue>{
    const model = await (ctx.db as ParkyDB).get(cid)
    if (model === undefined) {
      throw new Error('Not found ' + cid)
    }
    return model as DBBlockValue
  }

  @Query((returns) => [DBBlockValue])
  async blocks(
    @Args() { query, limit }: BlocksArgs,
    @Ctx() ctx: ServiceContext,
  ) {
    return (ctx.db as ParkyDB).getBlocksByTableName$('blockdb', (b) => {
      return () =>
        b
          .where({ ...query } as { [k: string]: string })
          .limit(limit)
          .toArray()
    })
  }

  // @Mutation(returns => StorageAsset)
  // @Authorized()
  // addRecipe(
  //   @Arg("newRecipeData") newRecipeData: NewRecipeInput,
  //   @Ctx("user") user: User,
  // ): Promise<Recipe> {
  //   return this.recipeService.addNew({ data: newRecipeData, user });
  // }

  // @Mutation(returns => Boolean)
  // @Authorized(Roles.Admin)
  // async removeRecipe(@Arg("id") id: string) {
  //   try {
  //     await this.recipeService.removeById(id);
  //     return true;
  //   } catch {
  //     return false;
  //   }
  // }
}
