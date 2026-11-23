/** Special Project 01: the page opened by the code hidden inside the hood. */
export interface Clip {
  base: string
  label: string
  title: string
  text: string
  zh: string
  photo?: boolean
}

export const SPECIAL_01_MEDIA = '/media/special/01/'

export const SPECIAL_01_CLIPS: Clip[] = [
  { base: 'cq-sunset', label: 'CHONGQING', title: 'A city on two rivers',
    text: 'Downtown Chongqing sits on a hilly peninsula where the Jialing River meets the Yangtze.',
    zh: '重庆渝中半岛，嘉陵江和长江在这里交汇。' },
  { base: 'cq-loops', label: 'CHONGQING', title: 'Roads that tie knots',
    text: 'In a mountain city, roads have to climb, so they loop and stack over each other to change levels.',
    zh: '山城的路要爬坡，所以会绕圈、叠在一起。' },
  { base: 'cq-hongyadong', label: 'CHONGQING', title: 'Hongyadong at night',
    text: 'Stilt-house style buildings stacked up a cliff over the Jialing River, lit gold every night.',
    zh: '洪崖洞：仿吊脚楼建筑沿着江边悬崖层层往上，每晚亮成金色。' },
  { base: 'hn-furong', label: 'HUNAN', title: 'A town on a waterfall',
    text: 'Furong Town in western Hunan: old stilt houses built right on the edge of a waterfall, with the water pouring past underneath.',
    zh: '湖南湘西芙蓉镇：吊脚楼建在瀑布边上，水从房子底下冲下去。' },
  { base: 'rail', label: 'HIGH-SPEED RAIL', title: 'The bullet train', photo: true,
    text: 'A CRH bullet train waiting at the platform. China runs the world’s largest high-speed rail network.',
    zh: '和谐号动车组。中国拥有世界上规模最大的高铁网络。' },
  { base: 'sh-lujiazui', label: 'SHANGHAI', title: 'Lujiazui after dark',
    text: 'Shanghai’s skyline on the Huangpu River. Look for the twisting one: Shanghai Tower, 632 m, the tallest building in China.',
    zh: '上海陆家嘴。找找那栋扭转的楼：上海中心大厦，632 米，中国最高的楼。' },
]

