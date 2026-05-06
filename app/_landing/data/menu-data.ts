// type
type IMenuDataType = {
  id: number;
  i18nKey: string;
  link: string;
  sub_menu?: {
      i18nKey: string;
      link: string;
  }[];
}

const menu_data:IMenuDataType[] = [
  {
    id:1,
    i18nKey:'home',
    link:'/',
  },
  {
    id:2,
    i18nKey:'about',
    link:'/#about',
  },
  {
    id:3,
    i18nKey:'features',
    link:'/#features',
  },
  {
    id:4,
    i18nKey:'pricing',
    link:'/pricing',
  },
  {
    id:5,
    i18nKey:'news',
    link:'/#news',
  },
  {
    id:6,
    i18nKey:'contact',
    link:'/#contact',
  },
]

export default menu_data;
