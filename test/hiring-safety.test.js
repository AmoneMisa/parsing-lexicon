import test from 'node:test';
import assert from 'node:assert/strict';

import { classifySuspicion } from '../src/hiring-safety.js';

test('a well-specified direct-employer vacancy clears clean', () => {
  const result = classifySuspicion({
    title: 'Backend Developer',
    company: 'Acme Software LLC',
    description: 'We are looking for a backend developer to develop and maintain our payments platform. '
      + 'Responsibilities: design and implement APIs, review pull requests, and support the on-call rotation. '
      + 'You will work with our product and engineering team on a Node.js service used by thousands of clients.',
    salaryMin: 2000,
    salaryMax: 3000,
    salaryCurrency: 'USD',
  });
  assert.equal(result.riskCategory, null);
  assert.equal(result.suspicious, false);
  assert.deepEqual(result.suspicionReasons, []);
});

test('gambling and betting-brand postings are hard-blocked', () => {
  const casino = classifySuspicion({ title: 'Casino dealer', description: 'Работа в казино' });
  assert.equal(casino.riskCategory, 'gambling');
  assert.ok(casino.riskReasons.includes('gambling:casino'));

  const brand = classifySuspicion({ title: 'Support agent', description: 'Работа с 1xbet' });
  assert.equal(brand.riskCategory, 'gambling');
  assert.ok(brand.riskReasons.includes('gambling:betting-brand'));
});

test('adult content roles are hard-blocked on a strong signal alone', () => {
  const result = classifySuspicion({ title: 'Model', description: 'OnlyFans модель, удалённая работа' });
  assert.equal(result.riskCategory, 'adult');
  assert.ok(result.riskReasons.includes('adult:onlyfans'));
});

test('a weak adult role signal needs an explicit accompanying signal to trigger', () => {
  const weakOnly = classifySuspicion({ title: 'Web model', description: 'Веб-модель, гибкий график, хороший доход' });
  assert.equal(weakOnly.riskCategory, null);

  const weakWithSignal = classifySuspicion({ title: 'Web model', description: 'Веб-модель, только девушки, 18+' });
  assert.equal(weakWithSignal.riskCategory, 'adult');
  assert.ok(weakWithSignal.riskReasons.includes('adult:role+explicit-signal'));
});

test('easy-money and no-investment earnings-bait phrasing is flagged as scam', () => {
  const result = classifySuspicion({
    title: 'Manager',
    description: 'Лёгкий заработок без вложений, выплаты ежедневно каждый день',
  });
  assert.equal(result.riskCategory, 'scam');
  assert.ok(result.riskReasons.includes('scam:easy-money'));
  assert.ok(result.riskReasons.includes('scam:no-investment'));
  assert.ok(result.riskReasons.includes('scam:daily-payout'));
});

test('a listed scam contact handle is flagged even without other scam phrasing', () => {
  const result = classifySuspicion({
    title: 'Assistant',
    description: 'Пишите нашему менеджеру @valery_hr_36 для деталей вакансии',
  });
  assert.equal(result.riskCategory, 'scam');
  assert.ok(result.riskReasons.includes('scam:known-contact:telegram:valery_hr_36'));
});

test('an externally reported Telegram handle from the moshelovka list is flagged', () => {
  const result = classifySuspicion({
    title: 'Operator',
    description: 'Подробности у @pitupishka в телеграм',
  });
  assert.equal(result.riskCategory, 'scam');
  assert.ok(result.riskReasons.includes('scam:reported-contact:moshelovka:pitupishka'));
});

test('a marriage/dating agency correspondence role is flagged as scam', () => {
  const result = classifySuspicion({
    title: 'Chat operator',
    company: 'Brand New Agency',
    description: 'Брачное агентство ищет оператора переписки от лица девушек с иностранцами',
  });
  assert.equal(result.riskCategory, 'scam');
  assert.ok(result.riskReasons.includes('scam:dating-agency'));
  assert.ok(result.riskReasons.includes('scam:dating-chat'));
});

test('paid-per-message mass spam recruitment is flagged as scam', () => {
  const result = classifySuspicion({
    title: 'Remote task',
    description: 'Оплата за каждое сообщение. Массовая рассылка сообщений в группы Telegram. Пришлите скриншот как подтверждение выполнения.',
  });
  assert.equal(result.riskCategory, 'scam');
  assert.ok(result.riskReasons.includes('scam:paid-spam-task'));
});

test('pay-before-you-start schemes (training fees, marketplace buyout, money mule, bank secrets) are all flagged', () => {
  const payToWork = classifySuspicion({
    title: 'Trainee',
    description: 'Перед началом работы необходимо оплатить курс обучения и внести взнос за доступ к заданиям.',
  });
  assert.ok(payToWork.riskReasons.includes('scam:pay-to-work'));

  const buyout = classifySuspicion({
    title: 'Reviewer',
    description: 'Wildberries выкуп товара для отзыва, комиссия вернём после подтверждения покупки.',
  });
  assert.ok(buyout.riskReasons.includes('scam:marketplace-buyout'));

  const mule = classifySuspicion({
    title: 'Finance assistant',
    description: 'Нужно принимать переводы на свою карту, а затем переводить % себе в качестве комиссии, остальное пересылать дальше.',
  });
  assert.ok(mule.riskReasons.includes('scam:money-mule'));

  const bankSecret = classifySuspicion({
    title: 'Verification agent',
    description: 'Пришлите код из смс и cvv для подтверждения перевода зарплаты.',
  });
  assert.ok(bankSecret.riskReasons.includes('scam:bank-credentials'));
});

test('vague high-training-promise recruitment without duties reads as scam', () => {
  const result = classifySuspicion({
    title: 'Remote earner',
    description: 'Научу как зарабатывать не выходя из дома. Особых навыков не требуется, опыт не нужен. '
      + 'Женщины от 20 до 40. Пишите в телеграм @somehandle12345 для подробностей.',
  });
  assert.equal(result.riskCategory, 'scam');
  assert.ok(result.riskReasons.includes('scam:vague-remote-earnings'));
});

test('an unlicensed Uzbekistan foreign-employment intermediary is a soft (unverified) warning, not a hard block', () => {
  const result = classifySuspicion({
    title: 'Recruiter',
    company: 'Random Agency LLC',
    description: 'Ташкент. Агентство по трудоустройству предлагает работу за границей, подбор работы за рубежом.',
  });
  assert.equal(result.riskCategory, null);
  assert.ok(result.suspicionReasons.includes('foreign-employment-license-unverified'));
  assert.equal(result.suspicious, true);
});

test('a licensed Uzbekistan foreign-employment agency does not trigger the unverified-license warning', () => {
  const result = classifySuspicion({
    title: 'Recruiter',
    company: 'Naimix',
    description: 'Ташкент. Агентство по трудоустройству предлагает работу за границей, подбор работы за рубежом. '
      + 'We handle visas, contracts, and onboarding for engineers, developers and clients across the company.',
  });
  assert.ok(!result.suspicionReasons.includes('foreign-employment-license-unverified'));
});

test('a vague title with no responsibilities and an unclear employer needs two signals to become suspicious', () => {
  const result = classifySuspicion({ title: 'Manager', company: '', description: 'Хорошие условия.' });
  assert.equal(result.riskCategory, null);
  assert.ok(result.suspicionReasons.includes('vague-title'));
  assert.ok(result.suspicionReasons.includes('no-responsibilities'));
  assert.ok(result.suspicionReasons.includes('unclear-employer'));
  assert.equal(result.suspicious, true, 'three soft signals cross the suspicious threshold');
});

test('a single soft signal alone does not cross the suspicious threshold', () => {
  const result = classifySuspicion({
    title: 'Backend Developer',
    company: 'Acme Software LLC',
    description: 'We are looking for a backend developer. Responsibilities include shipping features for our product and platform used by many clients across the industry.',
  });
  assert.equal(result.suspicionReasons.length, 0);
  assert.equal(result.suspicious, false);
});

test('an implausibly high salary with no described duties is flagged', () => {
  const result = classifySuspicion({
    title: 'Assistant',
    company: 'Some Company',
    description: 'Хорошие условия работы.',
    salaryMin: 6000,
    salaryMax: 6000,
    salaryCurrency: 'USD',
  });
  assert.ok(result.suspicionReasons.includes('high-salary-no-duties'));
});
