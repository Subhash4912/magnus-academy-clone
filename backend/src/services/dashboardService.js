const Employee = require('../models/Employee');
const trimmed = (field) => ({ $trim: { input: { $ifNull: [field, ''] } } });
const grouped = (field) => [
  { $project: { label: trimmed(field) } },
  {
    $group: {
      _id: { $cond: [{ $eq: ['$label', ''] }, 'Unspecified', '$label'] },
      count: { $sum: 1 },
    },
  },
  { $sort: { count: -1, _id: 1 } },
];
async function getDashboardStats() {
  // Every facet reads the same employee input in one database aggregation.
  const [result] = await Employee.aggregate([
    {
      $facet: {
        totals: [
          { $project: { gender: { $toLower: trimmed('$gender') } } },
          {
            $group: {
              _id: null,
              totalEmployees: { $sum: 1 },
              maleEmployees: {
                $sum: { $cond: [{ $eq: ['$gender', 'male'] }, 1, 0] },
              },
              femaleEmployees: {
                $sum: { $cond: [{ $eq: ['$gender', 'female'] }, 1, 0] },
              },
            },
          },
        ],
        employeesByCountry: grouped('$country'),
        employeesByState: grouped('$state'),
        employeesBySkill: [
          {
            $project: {
              skills: {
                $setUnion: [
                  {
                    $map: {
                      input: { $ifNull: ['$skills', []] },
                      as: 'skill',
                      in: trimmed('$$skill'),
                    },
                  },
                  [],
                ],
              },
            },
          },
          { $unwind: '$skills' },
          { $match: { skills: { $ne: '' } } },
          { $group: { _id: '$skills', count: { $sum: 1 } } },
          { $sort: { count: -1, _id: 1 } },
        ],
        recentEmployees: [
          { $sort: { createdAt: -1, _id: -1 } },
          { $limit: 5 },
          {
            $project: {
              firstName: 1,
              lastName: 1,
              email: 1,
              mobile: 1,
              createdAt: 1,
            },
          },
        ],
      },
    },
  ]);
  const {
    totalEmployees = 0,
    maleEmployees = 0,
    femaleEmployees = 0,
  } = result.totals[0] || {};
  return {
    totalEmployees,
    maleEmployees,
    femaleEmployees,
    otherGenderEmployees: totalEmployees - maleEmployees - femaleEmployees,
    employeesByCountry: result.employeesByCountry,
    employeesByState: result.employeesByState,
    employeesBySkill: result.employeesBySkill,
    recentEmployees: result.recentEmployees,
  };
}
module.exports = { getDashboardStats };
