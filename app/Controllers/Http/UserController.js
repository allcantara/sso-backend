// @ts-nocheck
'use strict'

const User = use('App/Models/User');
const Modulo = use('App/Models/Modulo')
const { validateAll } = use('Validator');
const Database = use('Database');
const Helpers = use('Helpers');


const erroMessages = {
  'username.required': 'O nome de usuário é obrigatório!',
  'email.required': 'O e-mail é obrigatório!',
  'password.required': 'A senha é obrigatória!',
  'username.unique': 'Este nome de usuário já existe!',
  'email.unique': 'Este e-mail já foi cadastrado!',
  'email.email': 'Este e-mail não é válido!',
  'username.min': 'O nome de usuário deve conter no mínimo 5 caracteres!',
  'password.min': 'A senha deve conter no mínimo 8 caracteres!',
}

class UserController {

  /**
   * 
   * Criar um novo usuário 
   */
  async create({ request, response }) {
    try{
      const validation = await validateAll(request.all(), {
        username: 'required|min:5|unique:users',
        email: 'required|email|unique:users',
        password: 'required|min:8'
      }, erroMessages);

      const file = request.file('file', {
        types: ['image'],
        size: '1mb',
        extnames: ['png', 'jpg', 'jpeg']
      })

      if(!validation.fails()) {
        const data = request.only(['username', 'email', 'password']);
        if(file) {
          await file.moveAll(Helpers.tmpPath('avatar_user'), item => ({
            name: `${Date.now()}-${item.clientName}`
          }))

          if(file.movedAll()) {
            await Promise.all(
              file.movedList().map(item => {
                data.path_image = item.fileName
              })
            )
            const user = await User.create(data);
            return user;
          } else {
            console.log(file.errors())
            return file.errors();
          }
        } else {
          data.path_image = '';
          const user = await User.create(data);
          return user
        }
      } else {
        console.log(validation.messages())
        return response.status(203).send({ message: validation.messages() });
      }
    } catch (e) {
      console.log(e)
      return response.status(500).send({ message: 'Falha ao inserir o registro.', error: e });
    }
  }


  /**
   * 
   * Buscar todos os usuários 
   */
  async index({ request, response, auth }) {
    try {
      const userAdmin = await auth.getUser()
      if(userAdmin && userAdmin.admin) {
        const data = await Database.select('id', 'username', 'email', 'path_image', 'approved', 'admin').from('users');
        return data;
      } else {
        return response.status(203).send({ message: 'Acesso negado!' });
      }
    } catch(err) {
      console.log(err)
      return response.status(500).send({
        message: 'Falha ao listar os usuários!',
        error: err
      });
    }
  }


  /**
   * 
   * Buscar um usuário
   */
  async show({ params, request, response, auth }) {
    try {
      const userAdmin = await auth.getUser();
      if(userAdmin && userAdmin.admin) {
        const user = await User.query().where('id', params.id).first();
        if(!user) return response.status(203).send({ message: 'Nenhum registro encontrado!' });
        return user;
      } else {
        return response.status(203).send({ message: 'Acesso negado!' });
      }
    } catch(err) {
      console.log(err)
      return response.status(500).send({ message: 'Falha ao buscar este usuário!', error: err });
    }
  }


  /**
   * 
   * Atualizar os dados de um usuário
   */
  async update({ params, request, response, auth }) {
    try{      
      const data = request.only(['username', 'email', 'password']);
      const validation = await validateAll(request.all(), {
        username: 'required|min:5',
        email: 'required|email',
        password: 'required|min:8'
      }, erroMessages);

      if(!validation.fails()) {
        const file = request.file('file', {
          types: ['image'],
          size: '1mb',
          extnames: ['png', 'jpg', 'jpeg']
        })
        
        if(file) {
          await file.moveAll(Helpers.tmpPath('avatar_user'), item => ({
            name: `${Date.now()}-${item.clientName}`
          }))

          if(file.movedAll()) {
            await Promise.all(
              file.movedList().map(item => {
                data.path_image = item.fileName
              })
            )
          } else {
            console.log(file.errors())
            return file.errors()
          }
        }

        const { id } = auth.user;
        const userAuth = await Database.select('id', 'admin').from('users').where('id', id).first();
        const user = await User.query().where('id', params.id).first();
        console.log(user.id === userAuth.id)
        if(user) {
          if(user.id === userAuth.id || userAuth.admin) {
            if(user.username !== data.username) user.username = data.username;
            if(user.email !== data.email) user.email = data.email;
            if(user.id === userAuth.id && user.password !== data.password) user.password = data.password;
            if(user.path_image !== data.path_image) user.path_image = data.path_image;

            await user.save();
            return user;
          } else {
            return response.status(203).send({
              message: 'Falha ao alterar os dados do usuário!',
              errors: [
                'Você não é um administrador!',
                'Você não pode alterar os dados de outro usuário!',
              ]
            });
          }
        } else {
          return response.status(203).send({ message: 'Este usuário não existe!' });
        }

      } else {
        console.log(validation.messages())
        return response.status(203).send({ message: validation.messages() });
      }
    } catch (e) {
      console.log(e)
      return response.status(500).send({ message: 'Falha ao inserir o registro.', error: e });
    }
  }


  /**
   * 
   * Deletar um usuário
   */
  async destroy({ params, request, response, auth }) {
    try {
      const userAdmin = await auth.getUser()
      if(userAdmin && userAdmin.admin) {
        const user = await User.query().where('id', params.id).first();
        if(!user) return response.status(203).send({ message: 'Nenhum registro encontrado!' });
        await user.delete()
        return response.status(200).send({ message: 'Registro excluído com sucesso!' });
      } else {
        return response.status(203).send({ message: 'Acesso negado!' });
      }
    } catch(err) {
      console.log(err)
      return response.status(500).send({ message: 'Falha ao buscar este usuário!', error: err });
    }
  }


  /**
   * 
   * Liberar ou revogar acesso de um usuário ao sistema
   */
  async approvedUser({ request, response, auth }) {
    try{
      const userAdmin = await auth.getUser()
      const { email, approved } = request.all();
      if(!email) return response.status(203).send({ message: 'O e-mail do usuário é obrigatório!' });
      if(userAdmin && userAdmin.admin) {
        const data = await User.query().where('email', email).first();
        if(data) {
          data.approved = approved;
          await data.save()
          return data;
        } else {
          return response.status(203).send({ message: 'Este usuário não existe!' });
        }
      } else {
        return response.status(203).send({ message: 'Você não pode aprovar este usuário!' });
      }
    } catch (e) {
      console.log(e)
      return response.status(500).send({ message: 'Falha ao aprovar usuário!', error: e });
    }
  }



}

module.exports = UserController
