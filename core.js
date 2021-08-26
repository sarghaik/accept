import axios from 'axios';
const remote_api_url = 'https://private-00d723-paysera.apiary-proxy.com';

export function calculatemaxcharge(amount, percents, maxcharge) {
  const result = Math.min((amount * percents) / 100, maxcharge);
  return (Math.ceil(100 * result) / 100).toFixed(2);
}

export function calculatemincharge(amount, percents, mincharge) {
  const result = Math.max((amount * percents) / 100, mincharge);
  return (Math.ceil(100 * result) / 100).toFixed(2);
}

export function calculateweeklimit(amount, percents, week_limit, weektotal) {
  const result =
    weektotal > week_limit ? (percents / 100) * Math.min(weektotal - week_limit, amount) : 0;
  return (Math.ceil(100 * result) / 100).toFixed(2);
}

export const calc = function (input, config) {
  return config ? calc_sync(input, config) : calc_async(input);
};

export const calc_sync = function (input, config) {
  return input.map((element, position) => {
    const currentconf =
      element.user_type === 'natural' ? config.natural[element.type] : config.legal[element.type];

    if (currentconf.max)
      return calculatemaxcharge(
        element.operation.amount,
        currentconf.percents,
        currentconf.max.amount
      );
    else if (currentconf.min)
      return calculatemincharge(
        element.operation.amount,
        currentconf.percents,
        currentconf.min.amount
      );
    else {
      const _date = new Date(element.date),
        startofweekdate = new Date(element.date);

      startofweekdate.setDate(
        _date.getDay() ? _date.getDate() + 1 - _date.getDay() : _date.getDate() - 6
      );

      const weektotal = input
        .filter(
          (el, p) =>
            p <= position && //to avoid calculating same date later transactions
            new Date(el.date) >= startofweekdate &&
            new Date(el.date) <= _date &&
            el.user_id === element.user_id &&
            el.type === element.type
        )
        .map((el) => el.operation.amount)
        .reduce((a, b) => a + b);

      return calculateweeklimit(
        element.operation.amount,
        currentconf.percents,
        currentconf.week_limit.amount,
        weektotal
      );
    }
  });
};

//bad solution loading config data for each input because of separate routes.
//much better would be provide all the config data once to avoid multiple calls like in local server case.
export const calc_async = async function (input, config = null) {
  return await Promise.all(
    input.map(async (element, position) => {
      const configurl =
        element.type === 'cash_out'
          ? `${remote_api_url}/cash-out-${element.user_type}`
          : `${remote_api_url}/cash-in`;
      const confreq = await axios.get(configurl);

      const currentconf = confreq.data;

      if (currentconf.max)
        return calculatemaxcharge(
          element.operation.amount,
          currentconf.percents,
          currentconf.max.amount
        );
      else if (currentconf.min)
        return calculatemincharge(
          element.operation.amount,
          currentconf.percents,
          currentconf.min.amount
        );
      else {
        const _date = new Date(element.date),
          startofweekdate = new Date(element.date);

        startofweekdate.setDate(
          _date.getDay() ? _date.getDate() + 1 - _date.getDay() : _date.getDate() - 6
        );

        const weektotal = input
          .filter(
            (el, p) =>
              p <= position && //to avoid calculating same date later transactions
              new Date(el.date) >= startofweekdate &&
              new Date(el.date) <= _date &&
              el.user_id === element.user_id &&
              el.type === element.type
          )
          .map((el) => el.operation.amount)
          .reduce((a, b) => a + b);

        return calculateweeklimit(
          element.operation.amount,
          currentconf.percents,
          currentconf.week_limit.amount,
          weektotal
        );
      }
    })
  );
};
