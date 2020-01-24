// @ts-nocheck
'use strict'

const { validateAll } = use('Validator');
const User = use('App/Models/User')
const Modulo = use('App/Models/Modulo')
const Database = use('Database');
const Encryption = use('Encryption')

class ModuleUtilController {

  /**
   * 
   * Buscar um módulo pela url 
   */
  async showModuleUrl({ request, response }) {
    try {
      const { url } = request.all();
      if(!url) return response.status(203).send({ message: 'A url é obrigatória!' });
      const data = await Database.select('id', 'user_id', 'name', 'url', 'module_secret').from('modulos').where('url', url).first();
      if(data) {
        return data;
      } else {
        return response.status(203).send({ message: 'O módulo da sua aplicação não está cadastrado!' });
      }
    } catch(err) {
      return response.status(500).send({ message: 'Falha ao buscar módulo pela url!', error: err });
    }
  }


  /**
   * 
   * Alterar a chave secreta de um módulo 
   */
  async updateModuleSecret ({ request, response, auth }) {
    try {
      const userAdmin = await auth.getUser()
      if(userAdmin && userAdmin.admin) {
        const { url } = request.all()
        const modulo = await Modulo.query().where('url', url).first();
        if(modulo) {
          const [min, max] = [1, 100];
          let numeros = Array(8).fill(0);
        
          for(let i = 0; i < numeros.length; i++) {
            let novo = 0;
            while(numeros.includes(novo)) {
              novo = Math.floor(Math.random() * (max - min + 1)) + min;
            }
            numeros[i] = novo;
          }
        
          numeros.sort((a, b) => a - b);
          let module_secret = Encryption.encrypt(numeros.join(''));
          modulo.module_secret = module_secret;
          await modulo.save();
          return modulo;
        } else {
          return response.status(203).send({ message: 'Este módulo não existe!' })      
        }
      } else {
        return response.status(203).send({ message: 'Você não tem permissão alterar este módulo!' })
      }
    } catch(err) {
      return response.status(500).send({ 
        message: 'Falha ao alterar o módulo!',
        error: err
      })
    }
  }

}

module.exports = ModuleUtilController
