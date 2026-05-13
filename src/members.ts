import { dbconnection } from './dbconn.js';
import { Member } from './common/member.js';
import { logError, logUser } from './utils/logger.js';
import { User } from './common/user.js';

const allowedMemberSortColumns = [
  'number',
  'fname',
  'surname',
  'email',
  'paidDate',
  'joinedDate',
  'subs',
  'committee'
];

function safeOrderBy(column: string): string {
  if (allowedMemberSortColumns.includes(column)) {
    return column;
  }
  return 'surname';
}

export function getMembers(request: { body: { data: string; }; }, response: { json: (arg0: Member[]) => void; }, next: (arg0: any) => void) {
  const orderBy = safeOrderBy(request.body.data?.toString() ?? '');
  const sql = `SELECT * FROM members ORDER BY ${orderBy} ASC`;

  dbconnection.query(sql, function (error: any, results: Member[]) {
    if (error != null) {
      next(error);
      return;
    }
    response.json(results);
  });
}

export function findMember(request: { body: { data: string; }; }, response: { json: (arg0: Member[]) => void; }, next: (arg0: any) => void) {
  const memberEmail = request.body.data;
  const sql = `SELECT * FROM members INNER JOIN logins ON lower(logins.email) = lower(members.email) WHERE members.email = ?`;

  dbconnection.query(sql, [memberEmail], function (error: any, results: Member[]) {
    if (error != null) {
      next(error);
      return;
    }
    response.json(results);
  });
}

export function findLoginName(request: { body: { data: string; }; }, response: { json: (arg0: User[]) => void; }, next: (arg0: any) => void) {
  const memberEmail = request.body.data;
  const sql = `SELECT * FROM logins INNER JOIN members ON lower(logins.email) = lower(members.email) WHERE members.email = ?`;

  dbconnection.query(sql, [memberEmail], function (error: any, results: User[]) {
    if (error != null) {
      next(error);
      return;
    }
    response.json(results);
  });
}

export function saveMember(request: { body: { data: Member; }; }, response: { json: (arg0: string) => void; }, next: (arg0: any) => void) {
  const member = request.body.data;

  const checkSql = `SELECT fname, surname FROM members WHERE surname = ? AND fname = ?`;
  dbconnection.query(checkSql, [member.surname, member.fname], function (error: any, results: any[]) {
    if (error != null) {
      next(error);
      return;
    }

    if (results.length > 0) {
      response.json('There is already a member with this name/forename. Please add a digit to the name if this is a genuine coincidence.');
      return;
    }

    const insertSql = `INSERT INTO members (fname, surname, gender, subs, phone, email, committee, address1, address2, address3, postcode, paidDate, joinedDate, waChat, waInfo, waLeisure, nextOfKin, nokPhone)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const insertParams = [
      member.fname,
      member.surname,
      member.gender,
      member.subs,
      member.phone,
      member.email,
      member.committee,
      member.address1,
      member.address2,
      member.address3,
      member.postcode,
      member.paidDate,
      member.joinedDate,
      member.waChat,
      member.waInfo,
      member.waLeisure,
      member.nextOfKin,
      member.nokPhone
    ];

    dbconnection.query(insertSql, insertParams, function (error: any, results: any) {
      if (error != null) {
        next(error);
        return;
      }
      member.number = results.insertId;
      logUser(`Member ${member.number} saved as ${member.fname} ${member.surname}`);
      response.json(member.number.toString());
    });
  });
}

export function editMember(request: { body: { data: Member; }; }, response: { json: (arg0: string) => void; }, next: (arg0: any) => void) {
  const member = request.body.data;

  const sql = `UPDATE members SET fname = ?, surname = ?, waChat = ?, waInfo = ?, waLeisure = ?, address1 = ?, address2 = ?, address3 = ?, postcode = ?, paidDate = ?, joinedDate = ?, subs = ?, phone = ?, email = ?, committee = ?, nextOfKin = ?, nokPhone = ? WHERE number = ?`;
  const params = [
    member.fname,
    member.surname,
    member.waChat,
    member.waInfo,
    member.waLeisure,
    member.address1,
    member.address2,
    member.address3,
    member.postcode,
    member.paidDate,
    member.joinedDate,
    member.subs,
    member.phone,
    member.email,
    member.committee,
    member.nextOfKin,
    member.nokPhone,
    member.number
  ];

  dbconnection.query(sql, params, function (error: any) {
    if (error != null) {
      next(error);
      return;
    }
    logUser(`Member ${member.number} edited as ${member.fname} ${member.surname}`);
    response.json('OK');
  });
}

export function payment(request: { body: { data: Member; }; }, response: { json: (arg0: string) => void; }, next: (arg0: any) => void) {
  const member = request.body.data;
  const sql = `UPDATE members SET paidDate = ? WHERE number = ?`;

  dbconnection.query(sql, [member.paidDate, member.number], function (error: any) {
    if (error != null) {
      next(error);
      return;
    }
    logUser(`Member ${member.fname} ${member.surname} updated payment date`);
    response.json('OK');
  });
}

export function deleteMember(request: { body: { data: Member; }; }, response: { json: (arg0: string) => void; }, next: (arg0: any) => void) {
  const member: Member = request.body.data;
  const sql = `UPDATE members SET address1 = '(lapsed)', address2 = '', address3 = '', postcode = '', phone = '', email = '', nokPhone = '', nextOfKin = '' WHERE number = ?`;

  dbconnection.query(sql, [member.number], function (error: any) {
    if (error != null) {
      next(error);
      return;
    }
    logUser(`Member ${member.fname} ${member.surname}: personal details have been deleted`);
    response.json('OK');
  });
}

