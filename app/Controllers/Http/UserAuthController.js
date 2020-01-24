// @ts-nocheck
'use strict'

const Database = use('Database');

class UserAuthController {

  /**
   * 
   * Autenticação de usuário 
   */
  async login({ request, response, auth }) {
    try{
        const { email, password } = request.all();
        if(!email || !password) {
          return response.status(203).send({ message: 'Todos os campos devem ser preenchidos!' })
        }
        const data = await Database.select('id', 'email', 'username', 'approved', 'admin').from('users').where('email', email).first();
        if(data) {
          if(data.approved) {
            const validToken = await auth.attempt(email, password);

            return { ...validToken, ...data };
          } else {
            return response.status(203).send({ message: 'Acesso negado!' })
          }
        } else {
          return response.status(203).send({ message: 'Este usuário não existe!' })
        }

    } catch(err) {
      console.log(err)
      if(err && err.passwordField === 'password') {
        return response.status(203).send({
          message: 'Sua senha está incorreta!'
        })
      }
      return response.status(500).send({
        message: 'Ocorreu um erro inesperado...',
        error: err
      });
    }
  }


  /**
   * 
   * Verificar se o usuário está logado 
   */
  async loggedUser({ request, response, auth }) {
    try {
      const valid = await auth.check();
      if(valid) {
        return response.status(200).send({ validToken: true });
      } 

      return response.status(203).send({ validToken: false, message: 'Token inválido!' });
      
    } catch(err) {
      console.log(err);
      return response.status(500).send({
        message: 'Ocorreu um erro na busca!',
        error: err
      })
    }
  }


  /**
   * 
   * Deslogar do sistema 
   */
  async logout({request, response, auth}) {
    try {
      await auth.logout()
      return response.status(200).send({ message: 'Sessão encerrada!' });
    } catch(err) {
      console.log(err);
      return response.status(500).send({ message: 'Falha ao desligar a sessão!' });
    }
  }

}

module.exports = UserAuthController
