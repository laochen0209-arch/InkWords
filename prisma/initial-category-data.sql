-- 初始数据脚本 - 为各个分类填充词语和句子
-- 执行前请确保数据库 schema 已更新（包含 category 字段）

-- 日常生活分类 - 20个词语
INSERT INTO "Vocabulary" ("id", "english", "chinese", "pinyin", "exampleEn", "exampleZh", "difficulty", "category", "createdAt", "updatedAt") VALUES
('vocab-daily-001', 'Breakfast', '早餐', 'zǎo cān', 'I usually have eggs and toast for breakfast.', '我通常早餐吃鸡蛋和吐司。', 1, 'daily', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-daily-002', 'Grocery', '杂货', 'zá huò', 'We need to buy groceries for the week.', '我们需要买一周的杂货。', 1, 'daily', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-daily-003', 'Laundry', '洗衣', 'xǐ yī', 'I do my laundry every Sunday.', '我每个周日洗衣服。', 1, 'daily', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-daily-004', 'Schedule', '日程', 'rì chéng', 'My schedule is very busy today.', '我今天的日程很忙。', 2, 'daily', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-daily-005', 'Routine', '例行公事', 'lì xíng gōng shì', 'Morning routine is important for productivity.', '早晨的例行公事对提高效率很重要。', 2, 'daily', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-daily-006', 'Commute', '通勤', 'tōng qín', 'My daily commute takes about an hour.', '我每天的通勤大约需要一小时。', 2, 'daily', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-daily-007', 'Household', '家庭', 'jiā tíng', 'Household chores need to be done regularly.', '家务需要定期做。', 1, 'daily', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-daily-008', 'Budget', '预算', 'yù suàn', 'We need to stick to our monthly budget.', '我们需要坚持每月的预算。', 2, 'daily', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-daily-009', 'Leisure', '休闲', 'xiū xián', 'I enjoy leisure activities on weekends.', '我喜欢在周末进行休闲活动。', 2, 'daily', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-daily-010', 'Hobby', '爱好', 'ài hào', 'Reading is my favorite hobby.', '阅读是我最喜欢的爱好。', 1, 'daily', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-daily-011', 'Exercise', '锻炼', 'duàn liàn', 'Regular exercise is good for health.', '定期锻炼对健康有益。', 1, 'daily', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-daily-012', 'Nutrition', '营养', 'yíng yǎng', 'Good nutrition is essential for a healthy life.', '良好的营养对健康生活至关重要。', 2, 'daily', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-daily-013', 'Sleep', '睡眠', 'shuì mián', 'Getting enough sleep is important.', '获得充足的睡眠很重要。', 1, 'daily', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-daily-014', 'Relaxation', '放松', 'fàng sōng', 'I need some relaxation after work.', '下班后我需要放松一下。', 2, 'daily', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-daily-015', 'Socialize', '社交', 'shè jiāo', 'I like to socialize with friends on weekends.', '我喜欢在周末和朋友社交。', 2, 'daily', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-daily-016', 'Appointment', '预约', 'yù yuē', 'I have a dentist appointment tomorrow.', '我明天有一个牙医预约。', 2, 'daily', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-daily-017', 'Errand', '差事', 'chāi shì', 'I need to run some errands this afternoon.', '我今天下午需要办些差事。', 2, 'daily', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-daily-018', 'Meal', '一餐', 'yī cān', 'We usually have three meals a day.', '我们通常一天吃三顿饭。', 1, 'daily', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-daily-019', 'Snack', '零食', 'líng shí', 'I like to have a healthy snack between meals.', '我喜欢在两餐之间吃健康的零食。', 1, 'daily', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-daily-020', 'Beverage', '饮料', 'yǐn liào', 'Coffee is my favorite morning beverage.', '咖啡是我最喜欢的早晨饮料。', 2, 'daily', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 金融分类 - 20个词语
INSERT INTO "Vocabulary" ("id", "english", "chinese", "pinyin", "exampleEn", "exampleZh", "difficulty", "category", "createdAt", "updatedAt") VALUES
('vocab-finance-001', 'Investment', '投资', 'tóu zī', 'Diversified investment reduces risk.', '多元化投资可以降低风险。', 3, 'finance', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-finance-002', 'Portfolio', '投资组合', 'tóu zī zǔ hé', 'My investment portfolio is well-balanced.', '我的投资组合很平衡。', 3, 'finance', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-finance-003', 'Dividend', '股息', 'gǔ xī', 'The company pays quarterly dividends.', '这家公司每季度支付股息。', 3, 'finance', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-finance-004', 'Interest', '利息', 'lì xī', 'The interest rate on savings is low.', '储蓄的利率很低。', 2, 'finance', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-finance-005', 'Inflation', '通货膨胀', 'tōng huò péng zhàng', 'Inflation affects purchasing power.', '通货膨胀影响购买力。', 3, 'finance', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-finance-006', 'Revenue', '收入', 'shōu rù', 'The company reported strong revenue growth.', '公司报告了强劲的收入增长。', 3, 'finance', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-finance-007', 'Expense', '费用', 'fèi yòng', 'We need to control our expenses.', '我们需要控制费用。', 2, 'finance', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-finance-008', 'Profit', '利润', 'lì rùn', 'The company made a significant profit this quarter.', '公司本季度实现了可观的利润。', 3, 'finance', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-finance-009', 'Asset', '资产', 'zī chǎn', 'Real estate is a valuable asset.', '房地产是有价值的资产。', 2, 'finance', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-finance-010', 'Liability', '负债', 'fù zhài', 'The company reduced its liabilities.', '公司减少了负债。', 3, 'finance', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-finance-011', 'Credit', '信用', 'xìn yòng', 'Good credit is essential for loans.', '良好的信用对于贷款至关重要。', 2, 'finance', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-finance-012', 'Debt', '债务', 'zhài wù', 'We need to pay off our debt gradually.', '我们需要逐步偿还债务。', 2, 'finance', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-finance-013', 'Budget', '预算', 'yù suàn', 'Financial planning requires a strict budget.', '财务规划需要严格的预算。', 2, 'finance', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-finance-014', 'Tax', '税收', 'shuì shōu', 'Income tax is deducted from salary.', '所得税从工资中扣除。', 2, 'finance', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-finance-015', 'Insurance', '保险', 'bǎo xiǎn', 'Health insurance is important for everyone.', '健康保险对每个人都很重要。', 2, 'finance', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-finance-016', 'Stock', '股票', 'gǔ piào', 'Stock prices fluctuate daily.', '股票价格每天都在波动。', 3, 'finance', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-finance-017', 'Bond', '债券', 'zhài quàn', 'Government bonds are considered safe investments.', '政府债券被认为是安全的投资。', 3, 'finance', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-finance-018', 'Currency', '货币', 'huò bì', 'Exchange rates affect international trade.', '汇率影响国际贸易。', 3, 'finance', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-finance-019', 'Bank', '银行', 'yín háng', 'I keep my savings in the bank.', '我把储蓄存在银行。', 1, 'finance', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-finance-020', 'Loan', '贷款', 'dài kuǎn', 'We applied for a mortgage loan.', '我们申请了抵押贷款。', 2, 'finance', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 旅游分类 - 20个词语
INSERT INTO "Vocabulary" ("id", "english", "chinese", "pinyin", "exampleEn", "exampleZh", "difficulty", "category", "createdAt", "updatedAt") VALUES
('vocab-travel-001', 'Destination', '目的地', 'mù dì dì', 'Paris is a popular travel destination.', '巴黎是一个受欢迎的旅游目的地。', 2, 'travel', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-travel-002', 'Itinerary', '行程', 'xíng chéng', 'Our itinerary includes visits to museums.', '我们的行程包括参观博物馆。', 2, 'travel', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-travel-003', 'Accommodation', '住宿', 'zhù sù', 'We booked hotel accommodation in advance.', '我们提前预订了酒店住宿。', 2, 'travel', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-travel-004', 'Reservation', '预订', 'yù dìng', 'I made a reservation for dinner.', '我预订了晚餐。', 1, 'travel', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-travel-005', 'Passport', '护照', 'hù zhào', 'You need a valid passport for international travel.', '国际旅行需要有效的护照。', 1, 'travel', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-travel-006', 'Visa', '签证', 'qiān zhèng', 'I applied for a tourist visa.', '我申请了旅游签证。', 2, 'travel', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-travel-007', 'Luggage', '行李', 'xíng li', 'Please check your luggage before boarding.', '登机前请检查您的行李。', 1, 'travel', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-travel-008', 'Flight', '航班', 'háng bān', 'Our flight was delayed due to weather.', '由于天气原因，我们的航班延误了。', 1, 'travel', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-travel-009', 'Boarding', '登机', 'dēng jī', 'Boarding will begin in 30 minutes.', '登机将在30分钟后开始。', 1, 'travel', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-travel-010', 'Customs', '海关', 'hǎi guān', 'We passed through customs quickly.', '我们很快通过了海关。', 2, 'travel', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-travel-011', 'Sightseeing', '观光', 'guān guāng', 'We spent the day sightseeing in the city.', '我们花了一天在城市观光。', 1, 'travel', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-travel-012', 'Attraction', '景点', 'jǐng diǎn', 'The Eiffel Tower is a famous attraction.', '埃菲尔铁塔是一个著名的景点。', 2, 'travel', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-travel-013', 'Souvenir', '纪念品', 'jì niàn pǐn', 'I bought souvenirs for my family.', '我为家人买了纪念品。', 2, 'travel', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-travel-014', 'Guide', '导游', 'dǎo yóu', 'The tour guide was very knowledgeable.', '导游非常博学。', 1, 'travel', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-travel-015', 'Transportation', '交通', 'jiāo tōng', 'Public transportation is convenient here.', '这里的公共交通很方便。', 2, 'travel', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-travel-016', 'Currency', '货币', 'huò bì', 'I exchanged currency at the airport.', '我在机场兑换了货币。', 2, 'travel', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-travel-017', 'Hotel', '酒店', 'jiǔ diàn', 'The hotel room was comfortable.', '酒店房间很舒适。', 1, 'travel', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-travel-018', 'Restaurant', '餐厅', 'cān tīng', 'We found a great restaurant near the hotel.', '我们在酒店附近找到了一家很棒的餐厅。', 1, 'travel', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-travel-019', 'Adventure', '冒险', 'mào xiǎn', 'Traveling is always an adventure.', '旅行总是一次冒险。', 2, 'travel', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-travel-020', 'Culture', '文化', 'wén huà', 'I love learning about different cultures.', '我喜欢了解不同的文化。', 2, 'travel', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 商务分类 - 20个词语
INSERT INTO "Vocabulary" ("id", "english", "chinese", "pinyin", "exampleEn", "exampleZh", "difficulty", "category", "createdAt", "updatedAt") VALUES
('vocab-business-001', 'Negotiation', '谈判', 'tán pàn', 'The negotiation was successful.', '谈判很成功。', 3, 'business', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-business-002', 'Contract', '合同', 'hé tóng', 'We signed the contract yesterday.', '我们昨天签署了合同。', 2, 'business', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-business-003', 'Meeting', '会议', 'huì yì', 'I have a meeting at 3 PM.', '我下午3点有一个会议。', 1, 'business', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-business-004', 'Presentation', '演示', 'yǎn shì', 'The presentation went well.', '演示进行得很顺利。', 2, 'business', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-business-005', 'Proposal', '提案', 'tí àn', 'We submitted a proposal for the project.', '我们为这个项目提交了提案。', 2, 'business', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-business-006', 'Strategy', '战略', 'zhàn lüè', 'Our business strategy focuses on innovation.', '我们的商业战略专注于创新。', 3, 'business', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-business-007', 'Marketing', '市场营销', 'shì chǎng yíng xiāo', 'Digital marketing is essential today.', '数字营销在今天至关重要。', 2, 'business', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-business-008', 'Sales', '销售', 'xiāo shòu', 'Sales increased by 20% this quarter.', '本季度销售增长了20%。', 2, 'business', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-business-009', 'Client', '客户', 'kè hù', 'We value our client relationships.', '我们重视客户关系。', 1, 'business', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-business-010', 'Partnership', '合作伙伴', 'hé zuò huǒ bàn', 'The partnership has been beneficial.', '这种合作伙伴关系是有益的。', 3, 'business', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-business-011', 'Management', '管理', 'guǎn lǐ', 'Effective management is crucial for success.', '有效的管理对成功至关重要。', 2, 'business', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-business-012', 'Leadership', '领导力', 'lǐng dǎo lì', 'Good leadership inspires the team.', '好的领导力能激励团队。', 3, 'business', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-business-013', 'Deadline', '截止日期', 'jié zhǐ rì qī', 'We need to meet the deadline.', '我们需要在截止日期前完成。', 2, 'business', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-business-014', 'Productivity', '生产力', 'shēng chǎn lì', 'Productivity tools help us work efficiently.', '生产力工具帮助我们高效工作。', 3, 'business', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-business-015', 'Communication', '沟通', 'gōu tōng', 'Clear communication prevents misunderstandings.', '清晰的沟通可以避免误解。', 2, 'business', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-business-016', 'Networking', '社交网络', 'shè jiāo wǎng luò', 'Networking events help build professional relationships.', '社交活动有助于建立职业关系。', 3, 'business', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-business-017', 'Recruitment', '招聘', 'zhāo pìn', 'We are recruiting new talent.', '我们正在招聘新人才。', 2, 'business', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-business-018', 'Training', '培训', 'péi xùn', 'Employee training improves skills.', '员工培训可以提高技能。', 2, 'business', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-business-019', 'Performance', '绩效', 'jì xiào', 'Performance reviews are conducted annually.', '绩效评估每年进行一次。', 2, 'business', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-business-020', 'Innovation', '创新', 'chuàng xīn', 'Innovation drives business growth.', '创新推动业务增长。', 3, 'business', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 科技分类 - 20个词语
INSERT INTO "Vocabulary" ("id", "english", "chinese", "pinyin", "exampleEn", "exampleZh", "difficulty", "category", "createdAt", "updatedAt") VALUES
('vocab-technology-001', 'Artificial Intelligence', '人工智能', 'rén gōng zhì néng', 'Artificial Intelligence is transforming industries.', '人工智能正在改变各行各业。', 3, 'technology', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-technology-002', 'Algorithm', '算法', 'suàn fǎ', 'The algorithm optimizes search results.', '这个算法优化了搜索结果。', 3, 'technology', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-technology-003', 'Database', '数据库', 'shù jù kù', 'We store customer data in a database.', '我们将客户数据存储在数据库中。', 2, 'technology', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-technology-004', 'Software', '软件', 'ruǎn jiàn', 'The software needs to be updated.', '这个软件需要更新。', 1, 'technology', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-technology-005', 'Hardware', '硬件', 'yìng jiàn', 'We need to upgrade our hardware.', '我们需要升级硬件。', 1, 'technology', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-technology-006', 'Network', '网络', 'wǎng luò', 'The network connection is unstable.', '网络连接不稳定。', 1, 'technology', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-technology-007', 'Cloud', '云', 'yún', 'Cloud computing offers scalability.', '云计算提供可扩展性。', 2, 'technology', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-technology-008', 'Cybersecurity', '网络安全', 'wǎng luò ān quán', 'Cybersecurity is a top priority.', '网络安全是首要任务。', 3, 'technology', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-technology-009', 'Programming', '编程', 'biān chéng', 'Programming requires logical thinking.', '编程需要逻辑思维。', 2, 'technology', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-technology-010', 'Application', '应用程序', 'yìng yòng chéng xù', 'I downloaded a new application.', '我下载了一个新的应用程序。', 1, 'technology', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-technology-011', 'Interface', '界面', 'jiè miàn', 'The user interface is intuitive.', '用户界面很直观。', 2, 'technology', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-technology-012', 'Automation', '自动化', 'zì dòng huà', 'Automation increases efficiency.', '自动化提高了效率。', 2, 'technology', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-technology-013', 'Data', '数据', 'shù jù', 'Data analysis helps decision-making.', '数据分析有助于决策。', 2, 'technology', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-technology-014', 'System', '系统', 'xì tǒng', 'The system crashed unexpectedly.', '系统意外崩溃了。', 1, 'technology', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-technology-015', 'Platform', '平台', 'píng tái', 'We launched a new platform.', '我们推出了一个新平台。', 2, 'technology', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-technology-016', 'Technology', '技术', 'jì shù', 'Technology advances rapidly.', '技术进步很快。', 1, 'technology', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-technology-017', 'Innovation', '创新', 'chuàng xīn', 'Technological innovation drives progress.', '技术创新推动进步。', 2, 'technology', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-technology-018', 'Digital', '数字', 'shù zì', 'Digital transformation is essential.', '数字化转型至关重要。', 2, 'technology', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-technology-019', 'Virtual', '虚拟', 'xū nǐ', 'Virtual reality offers immersive experiences.', '虚拟现实提供沉浸式体验。', 3, 'technology', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-technology-020', 'Smartphone', '智能手机', 'zhì néng shǒu jī', 'Most people own a smartphone.', '大多数人拥有智能手机。', 1, 'technology', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 文化分类 - 20个词语
INSERT INTO "Vocabulary" ("id", "english", "chinese", "pinyin", "exampleEn", "exampleZh", "difficulty", "category", "createdAt", "updatedAt") VALUES
('vocab-culture-001', 'Tradition', '传统', 'chuán tǒng', 'We respect our cultural traditions.', '我们尊重我们的文化传统。', 2, 'culture', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-culture-002', 'Heritage', '遗产', 'yí chǎn', 'The UNESCO World Heritage site is beautiful.', '联合国教科文组织世界遗产地很美。', 3, 'culture', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-culture-003', 'Custom', '习俗', 'xí sú', 'Every culture has unique customs.', '每种文化都有独特的习俗。', 2, 'culture', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-culture-004', 'Festival', '节日', 'jié rì', 'The Spring Festival is important in China.', '春节在中国很重要。', 1, 'culture', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-culture-005', 'Ceremony', '仪式', 'yí shì', 'The wedding ceremony was beautiful.', '婚礼仪式很美。', 2, 'culture', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-culture-006', 'Art', '艺术', 'yì shù', 'Art expresses human creativity.', '艺术表达人类的创造力。', 1, 'culture', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-culture-007', 'Music', '音乐', 'yīn yuè', 'Music transcends language barriers.', '音乐超越语言障碍。', 1, 'culture', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-culture-008', 'Literature', '文学', 'wén xué', 'Classic literature inspires readers.', '经典文学激励读者。', 2, 'culture', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-culture-009', 'History', '历史', 'lì shǐ', 'History teaches us valuable lessons.', '历史教给我们宝贵的教训。', 2, 'culture', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-culture-010', 'Philosophy', '哲学', 'zhé xué', 'Philosophy explores fundamental questions.', '哲学探索基本问题。', 3, 'culture', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-culture-011', 'Religion', '宗教', 'zōng jiào', 'Religion influences culture and society.', '宗教影响文化和社会。', 2, 'culture', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-culture-012', 'Architecture', '建筑', 'jiàn zhù', 'The architecture reflects the era.', '建筑反映了那个时代。', 2, 'culture', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-culture-013', 'Sculpture', '雕塑', 'diāo sù', 'The sculpture is a masterpiece.', '这座雕塑是杰作。', 2, 'culture', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-culture-014', 'Painting', '绘画', 'huì huà', 'Painting is a form of visual art.', '绘画是视觉艺术的一种形式。', 1, 'culture', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-culture-015', 'Dance', '舞蹈', 'wǔ dǎo', 'Traditional dance tells stories.', '传统舞蹈讲述故事。', 1, 'culture', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-culture-016', 'Theater', '戏剧', 'xì jù', 'The theater performance was captivating.', '戏剧表演很吸引人。', 2, 'culture', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-culture-017', 'Cuisine', '烹饪', 'pēng rèn', 'Local cuisine reflects regional culture.', '当地烹饪反映了区域文化。', 2, 'culture', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-culture-018', 'Language', '语言', 'yǔ yán', 'Language is a key part of culture.', '语言是文化的关键部分。', 1, 'culture', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-culture-019', 'Identity', '身份', 'shēn fèn', 'Cultural identity shapes who we are.', '文化身份塑造了我们是谁。', 2, 'culture', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('vocab-culture-020', 'Diversity', '多样性', 'duō yàng xìng', 'Cultural diversity enriches society.', '文化多样性丰富社会。', 2, 'culture', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 日常生活分类 - 10个句子
INSERT INTO "Sentence" ("id", "contentEn", "contentZh", "pinyin", "author", "category", "createdAt", "updatedAt") VALUES
('sentence-daily-001', 'A healthy lifestyle requires balance in diet, exercise, and rest.', '健康的生活方式需要在饮食、运动和休息之间保持平衡。', 'jiàn kāng de shēng huó fāng shì xū yào zài yǐn shí, yùn dòng hé xiū xi zhī jiān bǎo chí píng héng.', 'Health Expert', 'daily', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('sentence-daily-002', 'Small daily habits lead to significant long-term changes.', '小的日常习惯会带来显著的长期变化。', 'xiǎo de rì cháng xí guàn huì dài lái xiǎn zhù de cháng qī biàn huà.', 'Life Coach', 'daily', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('sentence-daily-003', 'Taking time for self-care is not selfish, it is necessary.', '花时间照顾自己不是自私，而是必要的。', 'huā shí jiān zhào gù zì jǐ bú shì zì sī, ér shì bì yào de.', 'Psychologist', 'daily', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('sentence-daily-004', 'Quality time with family strengthens relationships.', '与家人共度优质时光可以加强关系。', 'yǔ jiā rén gòng dù yōu zhì shí guāng kě yǐ jiā qiáng guān xi.', 'Family Therapist', 'daily', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('sentence-daily-005', 'A clutter-free environment promotes mental clarity.', '整洁的环境有助于思维清晰。', 'zhěng jié de huán jìng yǒu zhù yú sī wéi qīng xī.', 'Organizational Expert', 'daily', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('sentence-daily-006', 'Reading before bed improves sleep quality.', '睡前阅读可以提高睡眠质量。', 'shuì qián yuè dú kě yǐ tí gāo shuì mián zhì liàng.', 'Sleep Specialist', 'daily', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('sentence-daily-007', 'Cooking at home is healthier and more economical.', '在家做饭更健康也更经济。', 'zài jiā zuò fàn gèng jiàn kāng yě gèng jīng jì.', 'Nutritionist', 'daily', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('sentence-daily-008', 'Regular breaks during work increase productivity.', '工作期间定期休息可以提高生产力。', 'gōng zuò qī jiān dìng qī xiū xi kě yǐ tí gāo shēng chǎn lì.', 'Productivity Expert', 'daily', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('sentence-daily-009', 'Gratitude practice improves overall well-being.', '感恩练习可以改善整体幸福感。', 'gǎn ēn liàn xí kě yǐ gǎi shàn zhěng tǐ xìng fú gǎn.', 'Wellness Coach', 'daily', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('sentence-daily-010', 'Morning routines set the tone for the entire day.', '早晨的例行公事为整天定下基调。', 'zǎo chén de lì xíng gōng shì wèi zhěng tiān dìng xià jī diào.', 'Time Management Expert', 'daily', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 金融分类 - 10个句子
INSERT INTO "Sentence" ("id", "contentEn", "contentZh", "pinyin", "author", "category", "createdAt", "updatedAt") VALUES
('sentence-finance-001', 'Compound interest is the eighth wonder of the world.', '复利是世界第八大奇迹。', 'fù lì shì shì jiè dì bā dà qí jì.', 'Albert Einstein', 'finance', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('sentence-finance-002', 'Do not save what is left after spending, but spend what is left after saving.', '不要把花剩下的钱存起来，而是把存剩下的钱花掉。', 'bú yào bǎ huā shèng xià de qián cún qǐ lái, ér shì bǎ cún shèng xià de qián huā diào.', 'Warren Buffett', 'finance', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('sentence-finance-003', 'Investing should be more like watching paint dry than watching a roller coaster.', '投资应该更像看着油漆变干，而不是看着过山车。', 'tóu zī yīng gāi gèng xiàng kàn zhe yóu qī biàn gān, ér bú shì kàn zhe guò shān chē.', 'Peter Lynch', 'finance', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('sentence-finance-004', 'The stock market is a device for transferring money from the impatient to the patient.', '股市是将资金从急躁者转移到耐心者的工具。', 'gǔ shì shì jiāng zī jīn cóng jí zào zhě zhuǎn yí dào nài xīn zhě de gōng jù.', 'Warren Buffett', 'finance', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('sentence-finance-005', 'Diversification is protection against ignorance.', '多元化投资是对无知的保护。', 'duō yuán huà tóu zī shì duì wú zhī de bǎo hù.', 'Ray Dalio', 'finance', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('sentence-finance-006', 'Price is what you pay, value is what you get.', '价格是你付出的，价值是你得到的。', 'jià gé shì nǐ fù chū de, jià zhí shì nǐ dé dào de.', 'Warren Buffett', 'finance', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('sentence-finance-007', 'The four most dangerous words in investing are: this time it is different.', '投资中最危险的四个字是：这次不同。', 'tóu zī zhōng zuì wēi xiǎn de sì gè zì shì: zhè cì bù tóng.', 'Sir John Templeton', 'finance', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('sentence-finance-008', 'Risk comes from not knowing what you are doing.', '风险来自于你不知道自己在做什么。', 'fēng xiǎn lái zì yú nǐ bù zhī dào zì jǐ zài zuò shén me.', 'Warren Buffett', 'finance', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('sentence-finance-009', 'Time in the market beats timing the market.', '在市场中的时间胜过择时。', 'zài shì chǎng zhōng de shí jiān shèng guò zé shí.', 'Investment Proverb', 'finance', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('sentence-finance-010', 'A budget is telling your money where to go instead of wondering where it went.', '预算是告诉你的钱去哪里，而不是想知道它去了哪里。', 'yù suàn shì gào sù nǐ de qián qù nǎ lǐ, ér bú shì xiǎng zhī dào tā qù le nǎ lǐ.', 'Dave Ramsey', 'finance', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 旅游分类 - 10个句子
INSERT INTO "Sentence" ("id", "contentEn", "contentZh", "pinyin", "author", "category", "createdAt", "updatedAt") VALUES
('sentence-travel-001', 'The world is a book, and those who do not travel read only one page.', '世界是一本书，不旅行的人只读了其中一页。', 'shì jiè shì yī běn shū, bù lǚ xíng de rén zhǐ dú le qí zhōng yī yè.', 'Saint Augustine', 'travel', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('sentence-travel-002', 'Travel makes one modest. You see what a tiny place you occupy in the world.', '旅行让人谦逊。你会看到自己在世界上占据多么渺小的位置。', 'lǚ xíng ràng rén qiān xùn. nǐ huì kàn dào zì jǐ zài shì jiè shàng zhàn jù duō me miǎo xiǎo de wèi zhì.', 'Gustave Flaubert', 'travel', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('sentence-travel-003', 'To travel is to discover that everyone is wrong about other countries.', '旅行就是发现每个人对其他国家的看法都是错的。', 'lǚ xíng jiù shì fā xiàn měi gè rén duì qí tā guó jiā de kàn fǎ dōu shì cuò de.', 'Aldous Huxley', 'travel', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('sentence-travel-004', 'Adventure is worthwhile.', '冒险是值得的。', 'mào xiǎn shì zhí dé de.', 'Amelia Earhart', 'travel', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('sentence-travel-005', 'The journey not the arrival matters.', '重要的是旅程，而不是到达。', 'zhòng yào de shì lǚ chéng, ér bú shì dào dá.', 'T.S. Eliot', 'travel', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('sentence-travel-006', 'Travel is the only thing you buy that makes you richer.', '旅行是你唯一购买后能让你变得更富有的东西。', 'lǚ xíng shì nǐ wéi yī gòu mǎi hòu néng ràng nǐ biàn de gèng fù yǒu de dōng xi.', 'Anonymous', 'travel', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('sentence-travel-007', 'I haven\'t been everywhere, but it\'s on my list.', '我还没有去过所有地方，但这在我的清单上。', 'wǒ hái méi yǒu qù guò suǒ yǒu dì fāng, dàn zhè zài wǒ de qīng dān shàng.', 'Susan Sontag', 'travel', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('sentence-travel-008', 'Life is either a daring adventure or nothing at all.', '生活要么是一场大胆的冒险，要么什么都不是。', 'shēng huó yào me shì yī chǎng dà dǎn de mào xiǎn, yào me shén me dōu bú shì.', 'Helen Keller', 'travel', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('sentence-travel-009', 'We travel not to escape life, but for life not to escape us.', '我们旅行不是为了逃避生活，而是为了不让生活逃避我们。', 'wǒ men lǚ xíng bú shì wèi le táo bì shēng huó, ér shì wèi le bú ràng shēng huó táo bì wǒ men.', 'Anonymous', 'travel', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('sentence-travel-010', 'Travel is fatal to prejudice, bigotry, and narrow-mindedness.', '旅行对偏见、固执和狭隘思想是致命的。', 'lǚ xíng duì piān jiàn, gù zhí hé xiá ǎi sī xiǎng shì zhì mìng de.', 'Mark Twain', 'travel', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 商务分类 - 10个句子
INSERT INTO "Sentence" ("id", "contentEn", "contentZh", "pinyin", "author", "category", "createdAt", "updatedAt") VALUES
('sentence-business-001', 'Your work is going to fill a large part of your life, and the only way to be truly satisfied is to do what you believe is great work.', '你的工作将占据你生活的大部分，唯一真正满足的方式是做你认为伟大的工作。', 'nǐ de gōng zuò jiāng zhàn jù nǐ shēng huó de dà bù fen, wéi yī zhēn zhīng mǎn zú de fāng shì shì zuò nǐ rèn wéi wěi dà de gōng zuò.', 'Steve Jobs', 'business', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('sentence-business-002', 'Innovation distinguishes between a leader and a follower.', '创新区分了领导者和追随者。', 'chuàng xīn qū fēn le lǐng dǎo zhě hé zhuī suí zhě.', 'Steve Jobs', 'business', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('sentence-business-003', 'The best way to predict the future is to create it.', '预测未来的最好方法是创造未来。', 'yù cè wèi lái de zuì hǎo fāng fǎ shì chuàng zào wèi lái.', 'Peter Drucker', 'business', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('sentence-business-004', 'Success is not final, failure is not fatal: it is the courage to continue that counts.', '成功不是终点，失败也不是致命的：重要的是继续前进的勇气。', 'chéng gōng bú shì zhōng diǎn, shī bài yě bú shì zhì mìng de: zhòng yào de shì jì xù qián jìn de yǒng qì.', 'Winston Churchill', 'business', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('sentence-business-005', 'The way to get started is to quit talking and begin doing.', '开始的方法是停止谈论，开始行动。', 'kāi shǐ de fāng fǎ shì tíng zhǐ tán lùn, kāi shǐ xíng dòng.', 'Walt Disney', 'business', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('sentence-business-006', 'Business opportunities are like buses, there\'s always another one coming.', '商业机会就像公交车，总会有下一班。', 'shāng yè jī huì jiù xiàng gōng jiāo chē, zǒng huì yǒu xià yī bān.', 'Richard Branson', 'business', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('sentence-business-007', 'If you are not embarrassed by the first version of your product, you have launched too late.', '如果你对产品的第一个版本不感到尴尬，那你推出得太晚了。', 'rú guǒ nǐ duì chǎn pǐn de dì yī gè bǎn běn bú gǎn dào gān gà, nà nǐ tuī chū dé tài wǎn le.', 'Reid Hoffman', 'business', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('sentence-business-008', 'Focus on being productive instead of busy.', '专注于提高生产力，而不是忙碌。', 'zhuān zhù yú tí gāo shēng chǎn lì, ér bú shì máng lù.', 'Tim Ferriss', 'business', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('sentence-business-009', 'The only limit to our realization of tomorrow will be our doubts of today.', '实现明天的唯一限制是我们今天的怀疑。', 'shí xiàn míng tiān de wéi yī xiàn zhì shì wǒ men jīn tiān de huái yí.', 'Franklin D. Roosevelt', 'business', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('sentence-business-010', 'Don\'t be afraid to give up the good to go for the great.', '不要害怕放弃好的去追求伟大的。', 'bú yào hài pà fàng qì hǎo de qù zhuī qiú wěi dà de.', 'John D. Rockefeller', 'business', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 科技分类 - 10个句子
INSERT INTO "Sentence" ("id", "contentEn", "contentZh", "pinyin", "author", "category", "createdAt", "updatedAt") VALUES
('sentence-technology-001', 'Any sufficiently advanced technology is indistinguishable from magic.', '任何足够先进的技术都与魔法无异。', 'rèn hé zú gòu xiān jìn de jì shù dōu yǔ mó fǎ wú yì.', 'Arthur C. Clarke', 'technology', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('sentence-technology-002', 'The best way to predict the future is to invent it.', '预测未来的最好方法是发明它。', 'yù cè wèi lái de zuì hǎo fāng fǎ shì fā míng tā.', 'Alan Kay', 'technology', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('sentence-technology-003', 'Technology is best when it brings people together.', '当技术把人们聚集在一起时，它才是最好的。', 'dāng jì shù bǎ rén men jù jí zài yī qǐ shí, tā cái shì zuì hǎo de.', 'Matt Mullenweg', 'technology', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('sentence-technology-004', 'The advance of technology is based on making it fit in so that you don\'t really even notice it.', '技术的进步在于让它融入其中，以至于你甚至不会注意到它。', 'jì shù de jìn bù zài yú ràng tā róng rù qí zhōng, yǐ zhì yú nǐ shèn zhì bú huì zhù yì dào tā.', 'Bill Gates', 'technology', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('sentence-technology-005', 'Innovation is the calling card of the future.', '创新是未来的名片。', 'chuàng xīn shì wèi lái de míng piàn.', 'Anna Eshoo', 'technology', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('sentence-technology-006', 'The technology you use impresses no one. The experience you create with it is everything.', '你使用的技术不会给人留下深刻印象。你用它创造的体验才是一切。', 'nǐ shǐ yòng de jì shù bú huì gěi rén liú xià shēn kè yìn xiàng. nǐ yòng tā chuàng zào de tǐ yàn cái shì yī qiè.', 'Sean Gerety', 'technology', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('sentence-technology-007', 'Data is the new oil.', '数据是新石油。', 'shù jù shì xīn shí yóu.', 'Clive Humby', 'technology', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('sentence-technology-008', 'Artificial intelligence is the new electricity.', '人工智能是新电力。', 'rén gōng zhì néng shì xīn diàn lì.', 'Andrew Ng', 'technology', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('sentence-technology-009', 'The future belongs to those who learn more and combine better.', '未来属于那些学得更多、结合得更好的人。', 'wèi lái shǔ yú nà xiē xué de gèng duō, jié hé de gèng hǎo de rén.', 'Jonas Salk', 'technology', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('sentence-technology-010', 'Technology is nothing. What\'s important is that you have faith in people.', '技术什么都不是。重要的是你对人有信心。', 'jì shù shén me dōu bú shì. zhòng yào de shì nǐ duì rén yǒu xìn xīn.', 'Steve Jobs', 'technology', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 文化分类 - 10个句子
INSERT INTO "Sentence" ("id", "contentEn", "contentZh", "pinyin", "author", "category", "createdAt", "updatedAt") VALUES
('sentence-culture-001', 'Culture is the widening of the mind and of the spirit.', '文化是思想和精神的拓宽。', 'wén huà shì sī xiǎng hé jīng shén de kuān kuò.', 'Jawaharlal Nehru', 'culture', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('sentence-culture-002', 'A nation\'s culture resides in the hearts and in the soul of its people.', '一个国家的文化存在于人民的心和灵魂中。', 'yī gè guó jiā de wén huà cún zài yú rén mín de xīn hé líng hún zhōng.', 'Mahatma Gandhi', 'culture', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('sentence-culture-003', 'Culture does not make people. People make culture.', '文化不造就人，人造就文化。', 'wén huà bú zào jiù rén, rén zào jiù wén huà.', 'Chinua Achebe', 'culture', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('sentence-culture-004', 'Preservation of one\'s own culture does not require contempt or disrespect for other cultures.', '保护自己的文化不需要对其他文化表示蔑视或不尊重。', 'bǎo hù zì jǐ de wén huà bú xū yào duì qí tā wén huà biǎo shì miè shì huò bú zūn zhòng.', 'Cesar Chavez', 'culture', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('sentence-culture-005', 'Culture is the arts elevated to a set of beliefs.', '文化是提升到信仰层面的艺术。', 'wén huà shì tí shēng dào xìn yǎng céng miàn de yì shù.', 'Tom Wolfe', 'culture', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('sentence-culture-006', 'Without culture, and the relative freedom it implies, society, even when perfect, is but a jungle.', '没有文化及其所隐含的相对自由，社会即使完美，也只是丛林。', 'méi yǒu wén huà jí qí suǒ yǐn hán de xiāng duì zì yóu, shè huì jí shǐ wán měi, yě zhǐ shì cóng lín.', 'Albert Camus', 'culture', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('sentence-culture-007', 'Culture is the process by which a person becomes all that they were created capable of being.', '文化是一个人成为他们被创造所能成为的一切的过程。', 'wén huà shì yī gè rén chéng wéi tā men bèi chuàng zào suǒ néng chéng wéi de yī qiè de guò chéng.', 'Thomas Carlyle', 'culture', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('sentence-culture-008', 'The beauty of the world lies in the diversity of its people.', '世界之美在于其人民的多样性。', 'shì jiè zhī měi zài yú qí rén mín de duō yàng xìng.', 'Unknown', 'culture', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('sentence-culture-009', 'Cultural differences should not separate us from each other, but rather bring cultural richness and diversity.', '文化差异不应该把我们分开，而应该带来文化丰富性和多样性。', 'wén huà chā yì bú yīng gāi bǎ wǒ men fēn kāi, ér yīng gāi dài lái wén huà fēng fù xìng hé duō yàng xìng.', 'Shirin Ebadi', 'culture', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('sentence-culture-010', 'When we learn about other cultures, we learn about ourselves.', '当我们了解其他文化时，我们也了解了自己。', 'dāng wǒ men liǎo jiě qí tā wén huà shí, wǒ men yě liǎo jiě le zì jǐ.', 'Unknown', 'culture', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
