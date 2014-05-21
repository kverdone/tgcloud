# TEST
import sqlalchemy as sql
from collections import defaultdict
import re
import string
import os

_digits = re.compile('\d')
def contains_digits(d):
	return bool(_digits.search(d))

def is_ascii(s):
    return all(ord(c) < 128 for c in s)

ssl_path = os.path.join(os.getcwd(), 'static', 'mysql-ssl-ca-cert.pem')
conn_string = os.environ.get('CONN_STRING', 'uh-oh')
ssl = {'ssl': {'ca':ssl_path}}

def recent_entries(username):

	engine = sql.create_engine(conn_string, connect_args=ssl)

	conn = engine.connect()

	query = '''select f.description
				from feed_entry f 
				inner join (
				select id
				from user
				where username = '{0}') x
				on x.id = f.user_id
				where f.intake_type <> 'exercise'
				order by f.date_happened desc
				limit 25;'''.format(username)

	result = conn.execute(query)

	arr = []

	for row in result:
		arr.append(row[0])

	conn.close()

	return arr


def word_frequency(username, num):

	engine = sql.create_engine(conn_string, connect_args=ssl)

	conn = engine.connect()

	if num == 0:
		num = 100000

	query = '''select f.description
				from feed_entry f 
				inner join (
				select id
				from user
				where username = '{0}') x
				on x.id = f.user_id
				where f.intake_type <> 'exercise'
				order by f.date_happened desc
				limit {1};'''.format(username, num)

	result = conn.execute(query)

	nltksw = ['i','me','my','myself','we','our', \
 				'ours','ourselves','you','your','yours', \
 				'yourself','yourselves','he','him','his', \
 				'himself','she','her','hers','herself', \
 				'it','its','itself','they','them','their', \
 				'theirs','themselves','what','which', \
 				'who','whom','this','that','these', \
 				'those','am','is','are','was','were', \
 				'be','been','being','have','has','had', \
 				'having','do','does','did','doing','a', \
 				'an','the','and','but','if','or','because', \
 				'as','until','while','of','at','by','for', \
 				'with','about','against','between','into', \
 				'through','during','before','after','above', \
 				'below','to','from','up','down','in', \
 				'out','on','off','over','under','again', \
 				'further','then','once','here','there', \
 				'when','where','why','how','all','any', \
 				'both','each','few','more','most','other', \
 				'some','such','no','nor','not','only', \
 				'own','same','so','than','too','very', \
 				's','t','can','will','just','don', \
 				'should','now']

 	tgsw = ['one', 'two', 'three', 'four', 'five', \
 			'six', 'seven', 'eight', 'nine', 'ten', \
 			'eleven', 'twelve', 'dozen', 'cup', 'bowl', \
 			'plate', 'handful']


	d = defaultdict(int)

	for row in result:
		if row[0] == None:
			continue
		# print row[0]
		for word in row[0].split():
			
			if word.lower() in nltksw:
				# print 'Rejected: ', word
				break

			if word.lower() in tgsw:
				# print 'Rejected: ', word
				break

			if word[0] == '@':
				# print 'Rejected: ', word
				break

			if contains_digits(word):
				# print 'Rejected: ', word
				break

			if len(word) > 3 and word[-3:] == 'ing':
				# print 'Rejected: ', word
				break

			if len(word) > 11:
				# print 'Rejected: ', word
				break

			if word.lower() in tgsw:
				# print 'Rejected: ', word
				break

			if not is_ascii(word):
				# print 'Rejected: ', word
				break

			word = word.translate(None,string.punctuation)

			if word:
				# print word
				d[word.lower()] += 1

	conn.close()

	return d

