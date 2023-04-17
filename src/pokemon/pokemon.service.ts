import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Model, isValidObjectId } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PokemonService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
  ) {}

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();
    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  findAll() {
    return this.pokemonModel.find();
  }

  async findOne(terminoQueBusco: string) {
    let pokemon: Pokemon;
    if (!isNaN(+terminoQueBusco)) {
      pokemon = await this.pokemonModel.findOne({ no: terminoQueBusco });
    }
    if (!pokemon && isValidObjectId(terminoQueBusco)) {
      pokemon = await this.pokemonModel.findById(terminoQueBusco);
    }
    if (!pokemon) {
      pokemon = await this.pokemonModel.findOne({
        name: terminoQueBusco.toLowerCase().trim(),
      });
    }
    if (!pokemon)
      throw new NotFoundException(
        `Pokemon buscado por id, nombre o n° "${terminoQueBusco}" no se encontró`,
      );
    return pokemon;
  }

  async update(TerminoQueBusco: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(TerminoQueBusco);

    if (updatePokemonDto.name) {
      updatePokemonDto.name = updatePokemonDto.name.toLowerCase();
    }
    try {
      await pokemon.updateOne(updatePokemonDto);
      return { ...pokemon.toJSON(), ...updatePokemonDto };
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async remove(id: string) {
    const { deletedCount } = await this.pokemonModel.deleteOne({ _id: id });
    if (deletedCount === 0) {
      throw new BadRequestException(`Pokemon con id "${id}" no encontrada`);
    }
    return;
  }

  private handleExceptions(error: any) {
    if (error.code === 11000) {
      throw new BadRequestException(
        `Pokemon existe en la Base de Datos ${JSON.stringify(error.keyValue)}`,
      );
    }
    console.log(error);
    throw new InternalServerErrorException(
      `No se puede crear el pokemon. Chequee el servidor`,
    );
  }
}
