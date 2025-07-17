import requests
import random
import string
import time

BASE_URL = 'http://localhost:8000/api'

ADMIN_EMAIL = 'ert44039@gmail.com'
ADMIN_PASSWORD = '202010232'

# Generate a unique dummy email for each run
def unique_email():
    rand = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
    return f'apitestuser_{rand}@example.com'

USER_EMAIL = unique_email()
USER_PASSWORD = 'apitestpass123'
USER_NAME = 'apitestuser'
YOUTUBE_LINK = 'https://www.youtube.com/watch?v=s9Qh9fWeOAk&t=2s'

results = []
created_ids = {'user': None, 'course': None, 'playlist': None, 'task': None, 'community_post': None}

def print_result(endpoint, method, status, detail=None):
    msg = f"[{method}] {endpoint} -> {status}"
    if detail:
        msg += f" | {detail}"
    print(msg)
    results.append((endpoint, method, status, detail))

def register_user():
    url = f"{BASE_URL}/register"
    data = {
        'name': USER_NAME,
        'email': USER_EMAIL,
        'password': USER_PASSWORD,
        'username': USER_NAME
    }
    try:
        r = requests.post(url, data=data)
        if r.status_code in [200, 201]:
            print_result('/register', 'POST', r.status_code)
        elif 'already been taken' in r.text:
            print_result('/register', 'POST', r.status_code, 'Already registered')
        else:
            print_result('/register', 'POST', r.status_code, r.text)
    except Exception as e:
        print_result('/register', 'POST', 'ERROR', str(e))

def login(email, password):
    url = f"{BASE_URL}/login"
    data = {'email': email, 'password': password}
    try:
        r = requests.post(url, data=data)
        if r.status_code == 200 and 'token' in r.json():
            print_result('/login', 'POST', r.status_code)
            return r.json()['token']
        else:
            print_result('/login', 'POST', r.status_code, r.text)
            return None
    except Exception as e:
        print_result('/login', 'POST', 'ERROR', str(e))
        return None

def test_public_endpoints():
    endpoints = [
        ('/playlists', 'GET'),
        ('/playlists/1', 'GET'),
        ('/youtube/video-duration/test', 'GET'),
        ('/youtube/test/test', 'GET'),
        ('/test-admin', 'GET'),
    ]
    for ep, method in endpoints:
        url = f"{BASE_URL}{ep}"
        try:
            r = requests.request(method, url)
            print_result(ep, method, r.status_code)
        except Exception as e:
            print_result(ep, method, 'ERROR', str(e))

def test_playlist_crud(token):
    headers = {'Authorization': f'Bearer {token}'}
    # Create playlist (admin)
    url = f"{BASE_URL}/admin/playlists"
    data = {
        'video_id': 'apitestvideoid',
        'name': 'apitestplaylist',
        'description': 'dummy',
        'year': 1,
        'semester': 1
    }
    try:
        r = requests.post(url, headers=headers, json=data)
        if r.status_code in [200, 201]:
            print_result('/admin/playlists', 'POST', r.status_code)
            created_ids['playlist'] = r.json().get('id')
        else:
            print_result('/admin/playlists', 'POST', r.status_code, r.text)
    except Exception as e:
        print_result('/admin/playlists', 'POST', 'ERROR', str(e))
    # Update playlist
    if created_ids['playlist']:
        url = f"{BASE_URL}/admin/playlists/{created_ids['playlist']}"
        data = {'name': 'apitestplaylist_updated'}
        try:
            r = requests.put(url, headers=headers, json=data)
            print_result(f'/admin/playlists/{created_ids["playlist"]}', 'PUT', r.status_code)
        except Exception as e:
            print_result(f'/admin/playlists/{created_ids["playlist"]}', 'PUT', 'ERROR', str(e))
        # Delete playlist
        try:
            r = requests.delete(url, headers=headers)
            print_result(f'/admin/playlists/{created_ids["playlist"]}', 'DELETE', r.status_code)
        except Exception as e:
            print_result(f'/admin/playlists/{created_ids["playlist"]}', 'DELETE', 'ERROR', str(e))

def test_task_crud(token):
    headers = {'Authorization': f'Bearer {token}'}
    # Create task (admin)
    url = f"{BASE_URL}/admin/tasks"
    data = {
        'playlist_id': created_ids['playlist'] or 1,
        'title': 'apitesttask',
        'description': 'dummy',
        'type': 'mcq',
        'timestamp': '00:00:10',
        'points': 1,
        'question': 'What is 2+2?',
        'options': {'A': '3', 'B': '4', 'C': '5', 'D': '6'},
        'correct_answer': 'B',
    }
    try:
        r = requests.post(url, headers=headers, json=data)
        if r.status_code in [200, 201]:
            print_result('/admin/tasks', 'POST', r.status_code)
            created_ids['task'] = r.json().get('id')
        else:
            print_result('/admin/tasks', 'POST', r.status_code, r.text)
    except Exception as e:
        print_result('/admin/tasks', 'POST', 'ERROR', str(e))
    # Update task
    if created_ids['task']:
        url = f"{BASE_URL}/admin/tasks/{created_ids['task']}"
        data = {'title': 'apitesttask_updated'}
        try:
            r = requests.put(url, headers=headers, json=data)
            print_result(f'/admin/tasks/{created_ids["task"]}', 'PUT', r.status_code)
        except Exception as e:
            print_result(f'/admin/tasks/{created_ids["task"]}', 'PUT', 'ERROR', str(e))
        # Delete task
        try:
            r = requests.delete(url, headers=headers)
            print_result(f'/admin/tasks/{created_ids["task"]}', 'DELETE', r.status_code)
        except Exception as e:
            print_result(f'/admin/tasks/{created_ids["task"]}', 'DELETE', 'ERROR', str(e))

def test_user_progress(token):
    headers = {'Authorization': f'Bearer {token}'}
    # Save progress
    url = f"{BASE_URL}/user-progress"
    data = {'video_id': 'apitestvideoid', 'playlist_id': created_ids['playlist'] or 1, 'last_timestamp': '00:00:10'}
    try:
        r = requests.post(url, headers=headers, json=data)
        print_result('/user-progress', 'POST', r.status_code)
    except Exception as e:
        print_result('/user-progress', 'POST', 'ERROR', str(e))
    # Get progress
    try:
        r = requests.get(url, headers=headers)
        print_result('/user-progress', 'GET', r.status_code)
    except Exception as e:
        print_result('/user-progress', 'GET', 'ERROR', str(e))

def test_notifications(token):
    headers = {'Authorization': f'Bearer {token}'}
    url = f"{BASE_URL}/notifications"
    try:
        r = requests.get(url, headers=headers)
        print_result('/notifications', 'GET', r.status_code)
    except Exception as e:
        print_result('/notifications', 'GET', 'ERROR', str(e))

def test_community_crud(token):
    headers = {'Authorization': f'Bearer {token}'}
    # Create post
    url = f"{BASE_URL}/community/posts"
    data = {'title': 'apitestpost', 'content': 'dummy'}
    try:
        r = requests.post(url, headers=headers, json=data)
        if r.status_code in [200, 201]:
            print_result('/community/posts', 'POST', r.status_code)
            created_ids['community_post'] = r.json().get('id')
        else:
            print_result('/community/posts', 'POST', r.status_code, r.text)
    except Exception as e:
        print_result('/community/posts', 'POST', 'ERROR', str(e))
    # Update post
    if created_ids['community_post']:
        url = f"{BASE_URL}/community/posts/{created_ids['community_post']}"
        data = {'title': 'apitestpost_updated', 'content': 'dummy2'}
        try:
            r = requests.put(url, headers=headers, json=data)
            print_result(f'/community/posts/{created_ids["community_post"]}', 'PUT', r.status_code)
        except Exception as e:
            print_result(f'/community/posts/{created_ids["community_post"]}', 'PUT', 'ERROR', str(e))
        # Delete post
        try:
            r = requests.delete(url, headers=headers)
            print_result(f'/community/posts/{created_ids["community_post"]}', 'DELETE', r.status_code)
        except Exception as e:
            print_result(f'/community/posts/{created_ids["community_post"]}', 'DELETE', 'ERROR', str(e))

def test_admin_endpoints(token):
    headers = {'Authorization': f'Bearer {token}'}
    # List users
    url = f"{BASE_URL}/admin/users"
    try:
        r = requests.get(url, headers=headers)
        print_result('/admin/users', 'GET', r.status_code)
    except Exception as e:
        print_result('/admin/users', 'GET', 'ERROR', str(e))
    # List courses
    url = f"{BASE_URL}/admin/courses"
    try:
        r = requests.get(url, headers=headers)
        print_result('/admin/courses', 'GET', r.status_code)
    except Exception as e:
        print_result('/admin/courses', 'GET', 'ERROR', str(e))
    # List playlists
    url = f"{BASE_URL}/admin/playlists"
    try:
        r = requests.get(url, headers=headers)
        print_result('/admin/playlists', 'GET', r.status_code)
    except Exception as e:
        print_result('/admin/playlists', 'GET', 'ERROR', str(e))
    # List tasks
    url = f"{BASE_URL}/admin/tasks"
    try:
        r = requests.get(url, headers=headers)
        print_result('/admin/tasks', 'GET', r.status_code)
    except Exception as e:
        print_result('/admin/tasks', 'GET', 'ERROR', str(e))

def main():
    print('--- Registering test user ---')
    register_user()
    print('--- Logging in as test user ---')
    user_token = login(USER_EMAIL, USER_PASSWORD)
    print('--- Logging in as admin ---')
    admin_token = login(ADMIN_EMAIL, ADMIN_PASSWORD)
    print('--- Testing public endpoints ---')
    test_public_endpoints()
    if user_token:
        print('--- Testing user progress endpoints ---')
        test_user_progress(user_token)
        print('--- Testing notifications endpoints ---')
        test_notifications(user_token)
        print('--- Testing community CRUD endpoints ---')
        test_community_crud(user_token)
    if admin_token:
        print('--- Testing admin endpoints ---')
        test_admin_endpoints(admin_token)
        print('--- Testing playlist CRUD endpoints (admin) ---')
        test_playlist_crud(admin_token)
        print('--- Testing task CRUD endpoints (admin) ---')
        test_task_crud(admin_token)
    print('\n--- Test Summary ---')
    for ep, method, status, detail in results:
        print(f"[{method}] {ep} -> {status} {('| ' + detail) if detail else ''}")

if __name__ == '__main__':
    main() 