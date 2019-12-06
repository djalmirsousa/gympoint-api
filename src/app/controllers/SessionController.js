import jwt from 'jsonwebtoken';
import * as Yup from 'yup';
import User from '../models/User';
import authConfig from '../../config/auth';

class SessionController {
  async store(req, res) {
    const schema = Yup.object().shape({
      email: Yup.string().required(),
      password: Yup.string()
        .min(6)
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: 'Wrong e-mail' });
    }

    if (!(await user.checkPassword(password))) {
      return res.status(401).json({ error: 'Wrong password' });
    }

    const { id, name } = user;

    return res.json({
      id,
      name,
      email,
      token: jwt.sign({ id }, authConfig.secretKey, {
        expiresIn: authConfig.expiresIn,
      }),
    });
  }
}

export default new SessionController();
