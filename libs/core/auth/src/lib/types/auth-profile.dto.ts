import { PickType } from '@nestjs/swagger';
import { CreateAuthUserDto } from '../generated/rest/dto/create-auth-user.dto';

export class AuthProfileDto extends PickType(CreateAuthUserDto, ['timezone']) {}
