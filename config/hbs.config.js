const hbs = require('hbs');
const path = require('path');

hbs.registerPartials(path.join(__dirname, '../views/partials'));

const format = (s) => (s < 10) ? '0' + s : s

hbs.registerHelper('date', (date) => {
  var d = new Date(date)
  return [format(d.getDate()), format(d.getMonth() + 1), d.getFullYear()].join('/')
})

hbs.registerHelper('getProfileImage', (user) => {
  return user.logo || user.images[0];
})

hbs.registerHelper('getUser', (user) => {
  return user.role === "user" ? "/users" : "/companies";
})

hbs.registerHelper('equals', (user, event) => {
  return user.id == event.company;
})

hbs.registerHelper('isUser', (user) => {
  return user.role === 'user' ? true : false;
})

hbs.registerHelper('isEnrolled', (enrolls, event) => {
  return enrolls.some(enroll => enroll.event.id == event.id)
})


hbs.registerHelper('dateValue', (date)=>{
  const dateObj = new Date(date)
  return `${dateObj.getFullYear()}-${format(dateObj.getMonth()+1)}-${format(dateObj.getDate())}`
})
