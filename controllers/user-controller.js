const jdenticon = require('jdenticon');
const { prisma } = require('../prisma/prisma-client');
const bcrypt = require('bcryptjs'); // Исправлено имя переменной
const path = require('path');
const fs = require('fs');

const UserController = {
  register: async (req, res) => {
    const { email, password, name } = req.body;
    console.log(email, password, name);

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Все поля обязательны!' });
    }

    try {
      // Проверяем, существует ли пользователь
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'Пользователь уже существует!' });
      }

      // Хешируем пароль
      const hashedPassword = await bcrypt.hash(password, 10);

      // Генерируем SVG аватар
      const svg = jdenticon.toSvg(name, 200);

      // Определяем путь для сохранения аватара
      const uploadsDir = path.join(__dirname, '../uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const avatarFilename = `avatar_${Date.now()}.svg`;
      const avatarPath = path.join(uploadsDir, avatarFilename);

      // Сохраняем SVG в файл
      fs.writeFileSync(avatarPath, svg, 'utf-8');

      // Создаём пользователя в базе данных
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          avatarUrl: `/uploads/${avatarFilename}`,
        },
      });

      res.json(user);
    } catch (error) {
      console.error('Error in register', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  login: async (req, res) => {
    res.send('login');
  },
  getUserById: async (req, res) => {
    res.send('getUserById');
  },
  updateUser: async (req, res) => {
    res.send('updateUser');
  },
  current: async (req, res) => {
    res.send('current');
  },
};

module.exports = UserController;
