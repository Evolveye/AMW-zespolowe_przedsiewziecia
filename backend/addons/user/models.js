import { createModels, types } from "../graphql.js"
import { isEmailValid } from "../../priv/src/utils.js"

/** @typedef {import("../addon.js").default} Addon */


/** @param {Addon} param0 */
export default ({ baseCollectionName }) => {
  const { mongoose:UserModel, graphql:UserType } = createModels( `UserTest`,
    {
      id: types.ID,
      login: types.STRING,
      name: {
        type: types.STRING,
        minLength: 2,
        maxLength: 15,
        trim: true,
      },
      surname: {
        type: types.STRING,
        minLength: 2,
        maxLength: 15,
        trim: true,
      },
      email: {
        type: types.STRING,
        validate: [
          {
            validator: value => isEmailValid( value ),
            message: `Email validation failed`,
          },
          {
            validator: async value => !(await UserModel.findOne({ email:value })),
            message: `Email already in use.`,
          },
        ],
        message: `Email validation failed`,
      },
      password: types.STRING,
      avatar: types.STRING,
      activated: types.BOOLEAN,
      createdDateTime: types.DATE,
    }, {
      collection: baseCollectionName,
      description: `User object.`,
    },
  )

  return { UserModel, UserType }
}
