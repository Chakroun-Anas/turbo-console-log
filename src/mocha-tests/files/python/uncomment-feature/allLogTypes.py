import logging

def process_data(data):
    user_id = data['id']
    # print("🚀 ~ process_data ~ user_id:", user_id)

    if user_id:
        user = get_user(user_id)
        # print("🚀 ~ process_data ~ user:", user)

        if not user.get('email'):
            # logging.debug("🚀 ~ process_data ~ missing email: %s", user)

        result = {'user': user, 'processed': True}
        # logging.info("🚀 ~ process_data ~ result: %s", result)

        return result

    processed = process_user(data)
    # logging.warning("🚀 ~ processed: %s", processed)

    return processed
