import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class UsersService {

    private readonly users = [
        { id: 1, name: 'John Doe', age: 30 },
        { id: 2, name: 'Jane Smith', age: 25 },
        { id: 3, name: 'Bob Johnson', age: 40 },
      ];
    
      findAll() {
        return this.users;
      }

      create(user:{name: string, age: number}){
        const newUser = {
            id: this.users.length + 1,
            ...user,
        }
        this.users.push(newUser);
        return newUser;
      }

      delete(id:number){
        const index = this.users.findIndex((user)=> user.id ===id);
        if(index===-1){
            throw new NotFoundException(`user with id ${id} is not found`);
        }

        return this.users.splice(index, 1)[0];
    }
}
