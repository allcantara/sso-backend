// @ts-nocheck
'use strict'

const User = use('App/Models/User');
const UserToken = use('App/Models/UserToken');
const Database = use('Database');

class UserAuthController {

  async loggedUser({ request, response, auth }) {
    try {
      const verify = await auth.check();
      console.log(verify)
      const { id } = auth.user;
      const { url, module_secret, session_id } = request.all();
      const data = await UserToken.query().where('user_id', id).where('session_id', session_id).first();
      
      if(data) {
        const user = await Database.select('id', 'username', 'email').from('users').where('id', data.user_id).first();
        const modulo = await Database.select('user_id').from('modulos').where('url', url).where('module_secret', module_secret).first();

        if(modulo) {
          if(verify) {
            return response.status(200).send({ logged: true, user, auth: data });
          } else {
            data.token = null;
            data.session_id = null
            await data.save();
            await auth.authenticator('jwt').revokeTokensForUser(user);
            return response.status(203).send({ logged: false, message: 'Sessão encerrada!' });
          }
        } else {
          await auth.authenticator('jwt').revokeTokensForUser(user);
          return response.status(203).send({ message: 'Módulo inválido!' });
        }
      }
      return response.status(203).send({ logged: false, message: 'Sessão encerrada!' });
    } catch(err) {
      console.log(err);
      return response.status(500).send({
        message: 'Ocorreu um erro na busca!',
        error: err
      })
    }
  }

}

module.exports = UserAuthController
