// @ts-nocheck
'use strict'

const User = use('App/Models/User');
const Modulo = use('App/Models/Modulo')
const Database = use('Database');


class UserModuleController {

  /**
   * 
   * Vincular usuário em um módulo cadastrado 
   */
  async vinculeModuleUser({request, response, auth}) {
    try {

      const userAdmin = await auth.getUser();

      if(userAdmin && userAdmin.admin) {

        const { user_id, module_id} = request.all();

        const user = await User.query().where('id', user_id).first();
        if(!user) return response.status(203).send({ message: 'Este usuário não existe!' });
        
        if(user.module_id && user.module_id === module_id) return response.status(203).send({ message: 'Já vinculado!' });
        
        const modulo = await Database.select('id').from('modulos').where('id', module_id).first();
        if(!modulo) return response.status(203).send({ message: 'Este módulo não existe!' });

        user.module_id = modulo.id;
        
        return await user.save();
      }

      return response.status(203).send({ message: 'Não permitido!' });
    } catch(err) {
      console.log(err);
      return response.status(500).send({ message: 'Falha ao vincular módulo!' });
    }
  }



}

module.exports = UserModuleController
