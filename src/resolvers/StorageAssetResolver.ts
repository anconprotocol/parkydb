import 'reflect-metadata'

import {
  Arg,
  Args,
  ArgsType,
  Authorized,
  Ctx,
  Field,
  Int,
  Mutation,
  Query,
  Resolver,
} from 'type-graphql'
import { ParkyDB } from '../core/db'
import { ServiceContext } from '../parkydb-interfaces/interfaces/ServiceContext'
import { StorageAsset } from '../parkydb-interfaces/interfaces/StorageKind'

@ArgsType()
class StorageAssetArgs {
  @Field((type) => Int, { defaultValue: 10, nullable: true })
  limit!: number
}

@Resolver()
export class StorageAssetResolver {

  @Query((returns) => StorageAsset)
  async asset(@Arg('id') id: string, @Ctx() ctx: ServiceContext) {
    const model = await ctx.db.get(id)
    if (model === undefined) {
      throw new Error('Not found ' + id)
    }
    return model
  }

  @Query((returns) => [StorageAsset])
  async assets(
    @Args() { limit }: StorageAssetArgs,
    @Ctx() ctx: ServiceContext,
  ) {
    return ctx.db.getBlocksByTableName$('blockdb', (b) => {
      return () =>
        b.where({ 'document.kind': 'StorageAsset' }).limit(limit).toArray()
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
