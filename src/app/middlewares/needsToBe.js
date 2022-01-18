import User from '../../database/models/User';

const needsToBe = async (req, res, next, role = ['admin']) => {
  try {
    const { userId } = req;
    if (!userId) res.status(400).json({ message: 'invalid userId' });
    const user = await User.findByPk(userId);
    if (!user) res.status(404).json({ message: 'user not found' });

    if (!role.find((r) => user.role === r))
      res.status(403).json({ message: 'user do not have privilege' });
  } catch (error) {
    return res.status(401).json({ message: 'not enough privileges' });
  }
  return next();
};

export default needsToBe;
