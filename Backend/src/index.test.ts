import app, { insertGames, insertProfile, closeServer, checkAccount, hltbUpdate, manageLockout, fetchAndStoreProfiles, updateUserRelations, processAndStoreGames, getFinalResults} from './index';
import axios from 'axios';
import { Pool } from 'pg';
import request from 'supertest';
import { testSteamId, testFriendsList, testRecentGames, testPlayerSummary, testGameDetails, supabaseTestSteamId, sqlResult } from './TestingResponses';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const pool = new Pool({
  connectionString: process.env.DB_URL,
});

const testProfile = {
  response: {
    players: [
      {
        steamid: "76561199154033472",
        communityvisibilitystate: 3,
        profilestate: 1,
        personaname: "thorn1000",
        profileurl: "https://steamcommunity.com/profiles/76561199154033472/",
        avatar: "https://avatars.steamstatic.com/5538e220506aea324c1adfb5c53587625b2c939e.jpg",
        avatarmedium: "https://avatars.steamstatic.com/5538e220506aea324c1adfb5c53587625b2c939e_medium.jpg",
        avatarfull: "https://avatars.steamstatic.com/5538e220506aea324c1adfb5c53587625b2c939e_full.jpg",
        avatarhash: "5538e220506aea324c1adfb5c53587625b2c939e",
        lastlogoff: 1741812935,
        personastate: 1,
        primaryclanid: "103582791429521408",
        timecreated: 1616549496,
        personastateflags: 0
      }
    ]
  }
};

const testUserGames ={
  response: {
    game_count: 2,
    games: [
      {
        appid: 10,
        name: "Counter-Strike",
        playtime_forever: 0,
        img_icon_url: "6b0312cda02f5f777efa2f3318c307ff9acafbb5",
        content_descriptorids: [2, 5]
      },
      {
        appid: 80,
        name: "Counter-Strike: Condition Zero",
        playtime_forever: 0,
        img_icon_url: "077b050ef3e89cd84e2c5a575d78d53b54058236",
        content_descriptorids: [2, 5]
      }
    ]
  }
} 


beforeAll(async () => {
  await pool.connect();
  await pool.query('DELETE FROM "Profiles" WHERE "steam_id" = $1', [testSteamId]);
});

afterAll(async () => {
  closeServer();
});

test('insertProfile inserts a profile and returns true', async () => {
  mockedAxios.get.mockResolvedValueOnce({
    data: testProfile,
  });

  const result = await insertProfile(BigInt(testSteamId));
  expect(result).toBe(true);

  const res = await pool.query('SELECT * FROM "Profiles" WHERE "steam_id" = $1', [testSteamId]);
  expect(res.rows[0].steam_id).toEqual(testSteamId);
  expect(res.rows[0].username).toEqual(testProfile.response.players[0].personaname);
  expect(res.rows[0].avatar_hash).toEqual(testProfile.response.players[0].avatarhash);
});

test('insertGames inserts games and returns success message', async () => {
  mockedAxios.get.mockResolvedValueOnce({
    data: testUserGames,
  });

  const result = await insertGames(BigInt(testSteamId));
  expect(result).toEqual({ success: true, message: 'Games inserted/updated successfully.' });

  const res = await pool.query('SELECT * FROM "User_Games" WHERE "steam_id" = $1', [testSteamId.toString()]);

  expect(res.rows[0].steam_id).toEqual(testSteamId.toString());
  expect(res.rows[0].game_id).toEqual(testUserGames.response.games[0].appid.toString());
  expect(res.rows[0].total_played).toEqual(testUserGames.response.games[0].playtime_forever.toString());
});




describe('GET /steam/friendslist', () => {
  it('should return friends list', async () => {
    mockedAxios.get.mockResolvedValue({
      status: 200,
      data: testFriendsList,
    });

    const response = await mockedAxios.get(`/steam/friendsList?steamid=${testSteamId}`);

    expect(response.status).toBe(200);
    expect(response.data).toEqual(testFriendsList);
    expect(response.data).toHaveLength(5);
  });

  it('should handle no steam id', async () => {
    mockedAxios.get.mockResolvedValue({
      status: 400,
    });

    const response = await mockedAxios.get(`/steam/friendsList`);

    expect(response.status).toBe(400);
  });
});

describe('GET /steam/recentgames', () => {
  it('should return a list of games', async () => {
    mockedAxios.get.mockResolvedValue({
      status: 200,
      data: testRecentGames,
    });

    const response = await mockedAxios.get(`/steam/recentgames?steamid=${testSteamId}`);

    expect(response.status).toBe(200);
    expect(response.data).toEqual(testRecentGames);
    expect(response.data).toHaveLength(3);
  })
}) 

describe('GET /steam/playersummary', () => {
  it('should return a username and image', async () => {
    mockedAxios.get.mockResolvedValue({
      status: 200,
      data: testPlayerSummary,
    });

    const response = await mockedAxios.get(`/steam/playersummary?steamid=${testSteamId}`);

    expect(response.status).toBe(200);
    expect(response.data).toEqual(testPlayerSummary);
  })

  it('should handle no steam id', async () => {
    mockedAxios.get.mockResolvedValue({
      status: 400,
    });

    const response = await mockedAxios.get(`/steam/playersummary`);

    expect(response.status).toBe(400);
  });
}) 

describe('GET /games', () => {
  it('should return 3 random games from the database', async () => {
    const response = await request(app).get(`/games`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(3);
    expect(response.body[0]).toHaveProperty('game_id')
    expect(response.body[0]).toHaveProperty('description')
    expect(response.body[0]).toHaveProperty('name')
    expect(response.body[0]).toHaveProperty('header_image')
    expect(response.body[0]).toHaveProperty('metacritic_score')
    expect(response.body[0]).toHaveProperty('hltb_score')
  })
}) 

describe('GET /games/:gameid', () => {
  it('should return game details for the gameid', async () => {
    const response = await request(app).get(`/games/10`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('name')
    expect(response.body).toHaveProperty('header_image')
    expect(response.body).toHaveProperty('description')
    expect(response.body).toHaveProperty('hltb_score')
    //expect(response.body).toHaveProperty('recommendations')
    expect(response.body).toHaveProperty('price')
    expect(response.body).toHaveProperty('metacritic_score')
    expect(response.body).toHaveProperty('released')
    expect(response.body).toHaveProperty('platform')
  })

  it('should return not a valid game id', async () => {
    const response = await request(app).get(`/games/counter-strike`);

    expect(response.status).toBe(400);
    expect(response.body.error).toEqual('Invalid game ID format')
  })

  it('should return game not found', async () => {
    const response = await request(app).get(`/games/8`);

    expect(response.status).toBe(404);
    expect(response.body.error).toEqual('Game not found')
  })
}) 

describe('Check Account Visibility', () => {

  afterEach(() => {
      jest.clearAllMocks(); 
  });

  it('returns 3 when both game details and friends list are public', async () => {
      mockedAxios.get
          .mockResolvedValueOnce({ data: { response: { games: [{ appid: 123 }] } } }) 
          .mockResolvedValueOnce({ data: { friendslist: { friends: [{ steamid: '123' }] } } }); 

      const result = await checkAccount(testSteamId);
      expect(result).toBe(3);
  });

  it('returns 2 when only game details are public', async () => {
      mockedAxios.get
          .mockResolvedValueOnce({ data: { response: { games: [{ appid: 123 }] } } }) 
          .mockRejectedValueOnce({ data: { response: {} } }); 

      const result = await checkAccount(testSteamId);
      expect(result).toBe(2);
  });

  it('returns 1 when only friends list is public', async () => {
    mockedAxios.get
        .mockResolvedValueOnce({ data: { response: {} } }) 
        .mockResolvedValueOnce({ data: { friendslist: { friends: [{ steamid: '123' }] } } }); 

    const result = await checkAccount(testSteamId);
    expect(result).toBe(1);
  });

  it('returns 0 when both game details and friends list are private', async () => {
      mockedAxios.get
          .mockRejectedValueOnce({ data: { response: {} } }) 
          .mockRejectedValueOnce({ data: { response: {} } }); 

      const result = await checkAccount(testSteamId);
      expect(result).toBe(0);
  });

  it('handles API errors gracefully and returns 0', async () => {
      mockedAxios.get.mockRejectedValue(new Error('API request failed')); 

      const result = await checkAccount(testSteamId);
      expect(result).toBe(0);
  });
});

describe('GET /themepreference', () => {
  it('should return the users theme preference', async () => {
    const response = await request(app).get(`/themepreference?steamid=${supabaseTestSteamId}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({preference: 0})
  })

  it('should handle no steamid', async () => {
    const response = await request(app).get(`/themepreference`);

    expect(response.status).toBe(401);
  })
}) 

describe('PUT /themepreference', () => {
  it('should update the users theme preference to 1', async () => {
    const response = await request(app).put(`/themepreference?steamid=${supabaseTestSteamId}`).send({preference: 1});

    expect(response.status).toBe(200);
  })

  it('should update the users theme preference to 0', async () => {
    const response = await request(app).put(`/themepreference?steamid=${supabaseTestSteamId}`).send({preference: 0});

    expect(response.status).toBe(200);
  })
})

test('Delay Works and does lock you out', async () => {
    const selectResult = await pool.query('SELECT "code" FROM "Lockout"');
    const row = selectResult.rows[0];
    const currentStatus = row.code;
  
    if (currentStatus === 1) {
        const result1 = await manageLockout();
        expect(result1).toBe("You are presently locked out, please try again later");
      }else if (currentStatus === 0){
        const result0 = await manageLockout()
        expect(result0).toBeNull
    }

    if(currentStatus === 0){
        await pool.query('UPDATE "Lockout" SET "code" = 1', []);
        const result1 = await manageLockout()
        expect(result1).toBe("You are presently locked out, please try again later")
        await pool.query('UPDATE "Lockout" SET "code" = 0', []);
        const result0 = await manageLockout()
        expect(result0).toBeNull
    }
});

test('fetchAndProcessFriends works in both forced and unforced mode', async () => {
  //if testable, at the edge of what I feel comfortable faking
});

test('fetchAndStoreProfiles', async () => {
  //should be testable with a bit of faking
});

test('updateUserRelations', async () => {
  const testProfiles = [
    { steamId: '111', username: 'testing111', avatarHash: 'hash111' },
    { steamId: '222', username: 'testing222', avatarHash: 'hash222' },
    { steamId: '333', username: 'testing333', avatarHash: 'hash333' }
  ];

  await pool.query('DELETE FROM "Profiles" WHERE "steam_id" = ANY($1::bigint[])', [
    testProfiles.map(p => BigInt(p.steamId))
  ]);

  for (const profile of testProfiles) {
    await pool.query(
      'INSERT INTO "Profiles" ("steam_id", "username", "avatar_hash") VALUES ($1, $2, $3)',
      [BigInt(profile.steamId), profile.username, profile.avatarHash]
    );
  }

  const ourSteamId = '222';
  const relatedSteamIds = ['111', '333'];
  await updateUserRelations(ourSteamId, relatedSteamIds);

  const relationsResult = await pool.query(
    'SELECT "user1", "user2", "status" FROM "User_Relations" WHERE ("user1" = $1 OR "user2" = $1) ORDER BY "user1"',
    [BigInt(ourSteamId)]
  );

  const actualRelations = relationsResult.rows.map(row => ({
    user1: BigInt(row.user1),
    user2: BigInt(row.user2),
    status: row.status
  }));

  expect(actualRelations).toEqual([
    { user1: 111n, user2: 222n, status: 3 },
    { user1: 222n, user2: 333n, status: 3 }
  ]);

  await pool.query('DELETE FROM "Profiles" WHERE "steam_id" = ANY($1::bigint[])', [
    testProfiles.map(p => BigInt(p.steamId))
  ]);
});

test('processAndStoreGames', async () => {
  //i dont think that this is testable
});

test('getFinalResults', async () => {
  const results1 = await getFinalResults(BigInt(1));
  expect(results1).toEqual(sqlResult)

  const results2 = await getFinalResults(BigInt(4));
  expect(results2).toEqual([]);
});