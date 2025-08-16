STATUS_VALUE = {
    "fresh": 1.0,
    "evidenced": 0.9,
    "implemented": 0.8,
    "implementing": 0.5,
    "planning": 0.3,
    "mapped": 0.1,
}
INHERITANCE_MULTIPLIER = {
    "direct": 1.0,
    "conditional": 0.5,
    "advisory": 0.0,
    None: 1.0,  # local/baseline
}
