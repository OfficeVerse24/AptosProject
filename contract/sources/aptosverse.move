module module_addr::aptosverse {
    use std::error;
    use std::signer;
    use std::string::{Self, String};
    use aptos_framework::timestamp;

    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use std::vector;

    const ENOT_OWNER: u64 = 1;
    const EINVALID_BID: u64 = 2;
    const EAD_IN_USE: u64 = 3;
    const ENOT_AUTHORIZED: u64 = 4;


    struct Pool has key {
        fees: u64,
        coins : coin::Coin<AptosCoin>,
    }

    struct AdSpace has key {
        price_per_day: u64,
        current_bid: u64,
        min_bid: u64,
        bidder: address,
        start_time: u64,
        duration: u64,  // 1 day = 86400 seconds
        transaction_id: String
    }

    /// This function will be executed just after deployment.
    /// Or else add entry function to initialize with parameters.
    fun init_module(account: &signer) {
        // Initialize the pool with zero funds and zero earnings.
        move_to(account, Pool {
            fees: 0,
            coins : coin::zero<AptosCoin>(),
        });

        let ad_space = AdSpace {
            price_per_day: 100000000,
            current_bid: 0,
            min_bid: 0,
            bidder: signer::address_of(account),
            start_time: timestamp::now_seconds(),
            duration: 86400, // 1 day
            transaction_id: string::utf8(vector::empty<u8>())
        };

        move_to(account, ad_space);
    }

    /// Pay for the AD, add APT in Pool and update AdSpace
    public entry fun pay (account: &signer, days: u64) acquires Pool, AdSpace {
        coin::register<AptosCoin>(account);
        let pool = borrow_global_mut<Pool>(@module_addr);
        let coin = coin::withdraw<AptosCoin>(account, days * 100000000);
        pool.fees = pool.fees + days * 100000000;
        coin::merge(&mut pool.coins, coin);

        let ad_space = borrow_global_mut<AdSpace>(@module_addr);
        let current_time = timestamp::now_seconds();
        if (ad_space.bidder == signer::address_of(account))
            {
                // Update ad space duration
                if (ad_space.start_time == 0 || current_time > ad_space.start_time + ad_space.duration) {
                    ad_space.start_time = current_time;
                    ad_space.duration = days * 86400; // 1 day = 86400 seconds
                } else {
                    // Extend existing duration
                    ad_space.duration = ad_space.duration + (days * 86400);
                };
            } else {
            // Update AdSpace for a new user
            ad_space.bidder = signer::address_of(account);
            ad_space.start_time = current_time;
            ad_space.duration = days * 86400;
        }
    }

    /// Get amount in Pool
    public entry fun empty_pool (account: &signer) acquires Pool {
        assert!(signer::address_of(account) == @module_addr, error::permission_denied(ENOT_AUTHORIZED));
        coin::register<AptosCoin>(account);

        let pool = borrow_global_mut<Pool>(@module_addr);
        let coin = coin::extract_all(&mut pool.coins);
        coin::deposit(signer::address_of(account), coin);

    }

    public entry fun place_bid(bidder: &signer, transaction_id: String, ad_name: String, bid_amount: u64) acquires AdSpace, Pool {
        let ad_space = borrow_global_mut<AdSpace>(@module_addr);

        // Ensure bid is higher than the current bid
        assert!(bid_amount > ad_space.current_bid, error::invalid_argument(EINVALID_BID));

        // Ensure ad space isn't being used (1 day must pass)
        let current_time = timestamp::now_seconds();
        assert!(current_time >= ad_space.start_time + ad_space.duration, error::permission_denied(EAD_IN_USE));

        // Transfer Aptos tokens (APT) from bidder to the ad space
        let pool = borrow_global_mut<Pool>(@module_addr);
        let payment = coin::withdraw<AptosCoin>(bidder, bid_amount);
        coin::merge(&mut pool.coins, payment);

        // Update the ad space with the new bid
        ad_space.current_bid = bid_amount;
        ad_space.bidder = signer::address_of(bidder);
        ad_space.start_time = current_time;
        ad_space.transaction_id = transaction_id;
    }

    // Function to pay for an ad space for a certain number of days
    public entry fun pay_for_ad(account: &signer, transaction_id: String, days: u64) acquires AdSpace, Pool {
        let ad_space = borrow_global_mut<AdSpace>(@module_addr);
        assert!(ad_space.transaction_id == transaction_id, error::invalid_argument(EINVALID_BID));

        // Calculate total cost (0.1 APT per day = 10000000 Octas)
        let total_cost = ad_space.price_per_day * days * 10000000;
        coin::register<AptosCoin>(account);

        // Transfer funds to the pool
        let pool = borrow_global_mut<Pool>(@module_addr);
        let payment = coin::withdraw<AptosCoin>(account, total_cost);
        pool.fees = pool.fees + total_cost;
        coin::merge(&mut pool.coins, payment);

        // Update ad space timing
        let current_time = timestamp::now_seconds();
        if (ad_space.start_time == 0 || current_time > ad_space.start_time + ad_space.duration) {
            ad_space.start_time = current_time;
            ad_space.duration = days * 86400; // 1 day = 86400 seconds
        } else {
            // Extend existing duration
            ad_space.duration = ad_space.duration + (days * 86400);
        };
    }

    fun add_id(owner: &signer, transaction_id: String, ad_name: String, min_bid: u64) {
        // Create an ad space with a minimum bid
        let ad_space = AdSpace {
            price_per_day: 100000000,
            current_bid: min_bid,
            min_bid,
            bidder: signer::address_of(owner),
            start_time: timestamp::now_seconds(),
            duration: 86400, // 1 day
            transaction_id
        };

        move_to(owner, ad_space);
    }

    #[view]
    public fun current_ad() : String acquires AdSpace {
        let ad_space = borrow_global<AdSpace>(@module_addr);
        let current_time = timestamp::now_seconds();

        // Check if the ad is still active
        let result = if (ad_space.start_time == 0 || current_time > ad_space.start_time + ad_space.duration) {
            string::utf8(vector::empty<u8>())
        }
        else {ad_space.transaction_id};


        result
    }

    #[test]
    public entry fun test_ad(account: &signer) acquires AdSpace, Pool {
        init_module(account);
        pay(account,  2);
        empty_pool(account);
    }
}